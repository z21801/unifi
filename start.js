import { startNewProductMonitor } from "./newProduct.js";
import { startProductMonitor } from "./unifi.js";
import ps from "prompt-sync";
const prompt = ps({ sigint: true });

// startNewProductMonitor();
// setInterval(startNewProductMonitor, 60000);

// setInterval(startProductMonitor, 60000);
console.log("1. Monitor products from monitor.txt");
console.log("2. Monitor for new products");
console.log("3. Run both modules");
let chooseModule = prompt("Which module would you like to use? ");

switch (chooseModule) {
  case "1":
    startProductMonitor();
    setInterval(startProductMonitor, 60000);
    break;
  case "2":
    startNewProductMonitor();
    setInterval(startNewProductMonitor, 60000);
    break;
  case "3":
    startProductMonitor();
    setInterval(startProductMonitor, 60000);
    startNewProductMonitor();
    setInterval(startNewProductMonitor, 60000);
  default:
    break;
}
