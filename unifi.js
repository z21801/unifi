import axios from "axios";
import fs from "fs";
import "dotenv/config";
import { timestamp } from "./timestamp.js";
let config = {
  url: "https://store.ui.com/products.json?limit=250",
  validateStatus: false,
};

let startProductMonitor = () => {
  let data = fs.readFileSync("./monitor.txt", "utf-8", function (err, data) {
    if (err) {
      throw err;
    }
  });
  const lines = data.split("\n");
  let chosenKeywords = lines;
  console.log(chosenKeywords);

  // take keywords and make them lowercased and remove whitespaces
  const keywordsLowerCased = chosenKeywords.map((kw) =>
    kw.toLowerCase().trim()
  );

  axios.request(config).then((res) => {
    let inventory = [];
    const products = res.data.products;
    for (let i = 0; i < products.length; i++) {
      // find all products in early access
      if (keywordsLowerCased.includes(products[i].title.toLowerCase())) {
        let productTitle = products[i].title;
        let productHandle = products[i].handle.toLowerCase();
        let productVariants = products[i].variants;
        let productURL = `https://store.ui.com/products/${productHandle}`;
        let productImg = products[i].images[0].src;

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
    }
    // iterate through populated inventory array
    for (let i = 0; i < inventory.length; i++) {
      switch (inventory[i].availability) {
        case true: // if item is in stock...
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
          break;
        default:
          break;
      }
    }
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

export { startProductMonitor };
