import {
  loadUserData,
  loadInventory,
  updateUserData,
  updateInventory,
} from "./load_data.js";

let allItems_veg = document.querySelector(".allItems_veg");
let allItems_fruits = document.querySelector(".allItems_fruits");
let allItems_groceries = document.querySelector(".allItems_groceries");
const current_user = document.getElementById("username");

//begin of shopping cart logic
(async function () {
  class Product {
    constructor(productDetails) {
      this.name = productDetails.name;
      this.price = productDetails.price;
      this.available = productDetails.available;
      this.description = productDetails.description;
      this.file = productDetails.file;
      this.unit = productDetails.unit;
      this.type = productDetails.type;
    }
    getVegHTML() {
      return `
        <div class="item">
            <img class="itemImage" src="assets/img/${this.file}.png" /><br />
            <div class="itemName">${this.name} - ${this.unit}</div>
            <br />
            <div class="itemDescription">
            ${this.description}
            </div>
            <div class="hiddenName">${this.file}</div>
            <br />
            <div class="itemPrice">Price: ₹${this.price}</div>
          </div>
        `;
    }

    getFruitsHTML() {
      return `
          <div class="item">
              <img class="itemImage" src="assets/img/${this.file}.png" /><br />
              <div class="itemName">${this.name} - ${this.unit}</div>
              <br />
              <div class="itemDescription">
              ${this.description}
              </div>
              <div class="hiddenName">${this.file}</div>
              <br />
              <div class="itemPrice">Price: ₹${this.price}</div>
            </div>
          `;
    }

    getGroceriesHTML() {
      return `
          <div class="item">
              <img class="itemImage" src="assets/img/${this.file}.png" /><br />
              <div class="itemName">${this.name} - ${this.unit}</div>
              <br />
              <div class="itemDescription">
              ${this.description}
              </div>
              <div class="hiddenName">${this.file}</div>
              <br />
              <div class="itemPrice">Price: ₹${this.price}</div>
            </div>
          `;
    }
  }

  //cart class
  class CartProduct extends Product {
    constructor(productDetails) {
      super(productDetails);
      this.quantity = productDetails.quantity;
    }
    getCartHTML() {
      return `<div class="cartitem">
        <img
          class="cartitemImage"
          src="assets/img/${this.file}.png"
          height="100px"
        /><br />
        <div class="cartitemName">${this.name} - ${this.unit}</div>
        <br />
        <br />
        <br>
        <div class="cartitemPrice">Quantity : ${this.quantity} <br> <br>
        Price : ₹${this.quantity * this.price}
        </div>

        <div class="remove" data-item="${this.file}">Remove</div>
        <div class="checkout" data-item="${this.file}">Checkout</div>
      </div>
        `;
    }
  }

  //selected product class
  class SelectedProduct extends Product {
    constructor(productDetails) {
      super(productDetails);
    }
    getselectedHTML() {
      return `
            <img class="sldItemImage" src="assets/img/${this.file}.png"><br>
            <div class="sldItemName">${this.name}</div>
            <div class="sldItemDescription">${this.description}</div>
            <div class="sldItemPrice">Price : ₹${this.price}</div>
        `;
    }
  }

  let userData = await loadUserData();
  let inventory = await loadInventory();
  let inventoryObjects = [];
  let itemsDisplay = () => {
    inventoryObjects = [];
    Object.keys(inventory).forEach((i) => {
      inventoryObjects.push(new Product(inventory[i]));
    });

    for (var i = 0; i < inventoryObjects.length; i++) {
      if (inventoryObjects[i].type === "Vegetable") {
        allItems_veg.innerHTML += inventoryObjects[i].getVegHTML();
      }
      if (inventoryObjects[i].type === "Fruit") {
        allItems_fruits.innerHTML += inventoryObjects[i].getFruitsHTML();
      }
      if (inventoryObjects[i].type === "Groceries") {
        allItems_groceries.innerHTML += inventoryObjects[i].getGroceriesHTML();
      }
    }

    let item = document.querySelectorAll(".item");
    for (let i = 0; i < item.length; i++) {
      item[i].addEventListener("click", () => {
        let fileName = item[i].querySelector(".hiddenName");
        displaySelected(fileName.innerHTML);
      });
    }
  };
  itemsDisplay();

  //update username
  let user = window.sessionStorage.getItem("currentloggedin");
  current_user.innerHTML =
    "Hello,   " + " " + user.charAt(0).toUpperCase() + user.slice(1);

  let user_index;
  for (var i = 0; i < userData.length; i++) {
    if (userData[i].username === user) {
      user_index = i;
    }
  }

  //search
  let searchText = document.querySelector(".searchText");
  let searchButton = document.querySelector(".searchButton");

  //When a item is searched and selected item is displayed
  var i;
  searchText.addEventListener("input", () => {
    displaySelected(searchText.value);
  });

  //whenever search data is submited page reload is prevented
  searchButton.onclick = async (e) => {
    e.preventDefault();
  };

  //select an item to add to cart

  const selectedItemPopUp = function () {
    //for hide and show
    let selectedItem = document.querySelector(".selectedItem");
    if (selectedItem.style.display === "none") {
      selectedItem.style.display = "flex";
    } else {
      selectedItem.style.display = "none";
    }
  };

  let selectedItem = document.querySelector(".selectedItem");
  let addToCart = document.getElementById("addToCart");

  /**
   * @function When item selected, popup
   * @param {*} item
   */
  const displaySelected = function (item) {
    let innerSelected = document.querySelector(".innerSelected");
    let selectedItemObject = new SelectedProduct(inventory[item]);
    selectedItemPopUp();
    innerSelected.innerHTML = selectedItemObject.getselectedHTML();
    let closeSelected = document.querySelector(".closeSelected");
    closeSelected.addEventListener("click", selectedItemPopUp);
    addToCart.onclick = () => {
      itemToCart(item);
    };
  };

  //Adding items to cart section
  let cartItems = document.querySelector(".cartItems");
  let cartItemsText = document.querySelector(".cart-items");
  let totalprice = document.querySelector(".totalprice");
  let cartProducts = [];

  //-  Changing and invoking function at onload
  /**
   * @function Display cart items and do necessary updates in DB
   * @param {*} item
   */
  var itemToCart = async function (item) {
    if (item != "null") {
      let selectedQuantity = document.querySelector(".selectedQuantity");
      //to update products selected by user in products object {"tomato":1,"onion":1}
      if (userData[user_index].products[item] === undefined) {
        userData[user_index].products[item] = 0;
      }
      if (selectedQuantity.value <= inventory[item].available) {
        //update user data with products added to cart
        userData[user_index].products[item] =
          userData[user_index].products[item] +
          parseInt(selectedQuantity.value);
        //update inventory available
        inventory[item].available =
          inventory[item].available - parseInt(selectedQuantity.value);

        //update cart data
        userData[user_index].cart += parseInt(selectedQuantity.value);
        cartItemsText.innerHTML = userData[user_index].cart;

        alert("Successfully added to cart");
      } else {
        if (inventory[item].available > 0) {
          alert("Only " + inventory[item].available + "are available");
        } else {
          alert("Out of Stock");
        }
      }
    }

    //to get how many items in cart the user has - before leaving
    //update userdetails in backend
    updateUserData(userData);
    userData = await loadUserData();

    //update quantity based on user's products
    if (Object.keys(userData[user_index].products).length === 0) {
      Object.keys(inventory).forEach((i) => {
        inventory[i].quantity = 0;
      });
    } else {
      Object.keys(inventory).forEach((i) => {
        if (Object.keys(userData[user_index].products[i] === inventory[i])) {
          inventory[i].quantity = userData[user_index].products[i];
        }
      });
    }

    updateInventory(inventory);
    inventory = await loadInventory();

    //to display cart items
    cartProducts = [];
    Object.keys(inventory).forEach((i) => {
      cartProducts.push(new CartProduct(inventory[i]));
    });
    displayCartItems();
  };

  /**
   * @function Display cart items, update total, remove and checkout buttons logic
   */
  var displayCartItems = function () {
    let tot = 0;
    cartItems.innerHTML = "";

    for (let j = 0; j < cartProducts.length; j++) {
      if (cartProducts[j].quantity > 0) {
        cartItems.innerHTML += cartProducts[j].getCartHTML();
        tot += cartProducts[j].quantity * cartProducts[j].price;
      }
    }
    totalprice.innerHTML = `<div class="totalprice" style="text-align: center">
        <b>Total Price: ₹${tot}</b>
      </div>`;
    if (cartItems.innerHTML == "") {
      cartItems.innerHTML = `<div style="text-align:center">
            <i>No items in your cart</i>
            </div>`;
    }
    //Delete product from cart
    let delButton = document.querySelectorAll(".remove");
    for (let j = 0; j < delButton.length; j++) {
      delButton[j].addEventListener("click", () => {
        let dataItem = delButton[j].getAttribute("data-item");
        userData[user_index].products[dataItem] =
          userData[user_index].products[dataItem] - 1;
        inventory[dataItem].available += 1;
        tot = tot - inventory[dataItem].price;
        totalprice.innerHTML = `<div class="totalprice" style="text-align: center">
          <b>Total Price: ₹${tot}</b>
        </div>`;
        userData[user_index].cart -= 1;
        cartItemsText.innerHTML = userData[user_index].cart;
        itemToCart("null");
      });
    }

    //individual checkout

    let checkoutBtn = document.querySelectorAll(".checkout");
    for (let j = 0; j < delButton.length; j++) {
      checkoutBtn[j].addEventListener("click", () => {
        let dataItem = checkoutBtn[j].getAttribute("data-item");
        userData[user_index].cart -= userData[user_index].products[dataItem];
        cartItemsText.innerHTML = userData[user_index].cart;
        userData[user_index].products[dataItem] = 0;
        tot = tot - inventory[dataItem].price;
        totalprice.innerHTML = `<div class="totalprice" style="text-align: center">
          <b>Total Price: ₹${tot}</b>
        </div>`;
        itemToCart("null");
      });
    }
  };

  //Invoked for first time to hide the display
  selectedItemPopUp();
  cartItemsText.innerHTML = userData[user_index].cart;
  itemToCart("null");

  //go to cart
  let cartIcon = document.querySelector(".cart");
  cartIcon.addEventListener("click", () => {
    document.getElementById("blur").style.filter = "blur(20px)";
    let cartBox = document.querySelector(".cartBox");
    let item = document.querySelectorAll(".item");
    for (let i = 0; i < item.length; i++) {
      item[i].style.pointerEvents = "none";
    }
    cartBox.style.display = "block";
  });
  //checkoutAll
  let cartContent = document.getElementById("cart-content");
  let checkoutAllButton = document.querySelector(".checkoutallButton");
  checkoutAllButton.addEventListener("click", () => {
    Object.keys(userData[user_index].products).forEach((i) => {
      userData[user_index].products[i] = 0;
    });
    userData[user_index].cart = 0;
    cartItemsText.innerHTML = userData[user_index].cart;
    updateUserData(userData);
    window.location.href = "thankyou.html";
  });

  //TO close the cart window
  let closeCart = document.querySelector("#closeCart");
  closeCart.addEventListener("click", () => {
    let cartBox = document.querySelector(".cartBox");
    cartBox.style.display = "none";
    document.getElementById("blur").style.filter = "blur(0px)";
    let item = document.querySelectorAll(".item");
    for (let i = 0; i < item.length; i++) {
      item[i].style.pointerEvents = "auto";
    }
  });
})();
