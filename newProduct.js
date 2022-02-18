import axios from "axios";
import "dotenv/config";
import { timestamp } from "./timestamp.js";

let config = {
  url: "https://store.ui.com/products.json?limit=1",
  validateStatus: false,
};

let startNewProductMonitor = () => {
  axios.request(config).then((res) => {
    let productBefore = "";
    let productAfter = "";

    let inventory = [];
    const products = res.data.products;
    for (let i = 0; i < products.length; i++) {
      productBefore = products[i].title;
    }
    console.log(`${timestamp()} productBefore: ${productBefore}`);
    setTimeout(() => {
      axios.request(config).then((res) => {
        for (let i = 0; i < products.length; i++) {
          let productTitle = products[i].title;
          let productHandle = products[i].handle.toLowerCase();
          let productVariants = products[i].variants;
          let productURL = `https://store.ui.com/products/${productHandle}`;
          let productImg = products[i].images[0].src;
          productAfter = products[i].title;
          for (let i = 0; i < productVariants.length; i++) {
            // if multiple variants exist, list them.
            if (productVariants[i].title != "Default Title") {
              // push item details into an inventory array as an object
              inventory.push({
                title: productTitle,
                variants: productVariants[i].title,
                availability: productVariants[i].available,
                url: `${productURL}?variant=${productVariants[i].id}`,
                atc: `https://store.ui.com/cart/${productVariants[i].id}:1`,
              });
            } else {
              // push item details into an inventory array as an object
              inventory.push({
                title: productTitle,
                variants: "N/A",
                availability: productVariants[i].available,
                url: productURL,
                image: productImg,
              });
            }
          }
        }
        console.log(`${timestamp()} productAfter: ${productAfter}`);
        if (productBefore != productAfter) {
          for (let i = 0; i < inventory.length; i++) {
            if (inventory[i].variants !== "N/A") {
              console.log(
                `${inventory[i].title} ${inventory[i].variants} - ${inventory[i].availability} - ${inventory[i].url} - ${inventory[i].image}`
              );
              sendInStockWebhook(
                inventory[i].title,
                inventory[i].url,
                inventory[i].image
              );
            } else {
              console.log(
                `${inventory[i].title} - ${inventory[i].availability} - ${inventory[i].url} - ${inventory[i].image}`
              );
              sendInStockWebhook(
                inventory[i].title,
                inventory[i].url,
                inventory[i].image
              );
            }
          }
        }
      });
    }, 30000);
  });
};

let sendInStockWebhook = (itemName, itemURL, itemImg) => {
  axios
    .post(process.env.WEBHOOK_URL, {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: "0076D7",
      summary: `${itemName} is in stock!`,
      sections: [
        {
          activityTitle: `${itemName} is in stock!`,
          activitySubtitle: "found by Gene's Unifi monitor",
          activityImage: itemImg,
          facts: [
            {
              name: "Product",
              value: itemName,
            },
            {
              name: "URL",
              value: itemURL,
            },
          ],
          markdown: true,
        },
      ],
    })
    .then(function (response) {
      if (response.status === 200) {
        console.log("Webhook Sent!");
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

export { startNewProductMonitor };
