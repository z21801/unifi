import axios from "axios";
import readline from "readline";
import fs from "fs";

let config = {
  url: "https://store.ui.com/products.json",
  validateStatus: false,
};

setInterval(() => {
  let data = fs.readFileSync("./monitor.txt", "utf-8", function (err, data) {
    if (err) {
      throw err;
    }
  });
  const lines = data.split("\n");
  let chosenKeywords = lines;
  console.log(chosenKeywords);

  axios.request(config).then((res) => {
    let inventory = [];
    const products = res.data.products;
    for (let i = 0; i < products.length; i++) {
      let productTitle = products[i].title;
      let productHandle = products[i].handle.toLowerCase();
      let productVariants = products[i].variants;
      let productURL = `https://store.ui.com/collections/early-access/products/${productHandle}`;
      let ATCLink = "https://store.ui.com/cart/39734811230297:1";
      // find all products in early access
      if (productHandle.includes("-ea")) {
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
            });
          }
        }
      }
    }
    // take keywords and make them lowercased and remove whitespaces
    const keywordsLowerCased = chosenKeywords.map((kw) =>
      kw.toLowerCase().trim()
    );
    // iterate through populated inventory array
    for (let i = 0; i < inventory.length; i++) {
      // if keyword matches
      if (keywordsLowerCased.includes(inventory[i].title.toLowerCase())) {
        switch (inventory[i].availability) {
          case true: // if item is in stock...
            if (inventory[i].variants !== "N/A") {
              console.log(
                `${inventory[i].title} ${inventory[i].variants} - ${inventory[i].availability} - ${inventory[i].url}`
              );
            } else {
              console.log(
                `${inventory[i].title} - ${inventory[i].availability} - ${inventory[i].url}`
              );
            }
            break;
          default:
            break;
        }
      }
    }
  });
}, 5000);
