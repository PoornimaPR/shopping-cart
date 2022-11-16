let hostname = location.hostname;
let port = location.port;

let baseURL = `http://${hostname}:${port}`;
export let loadUserData = () => {
  return new Promise((resolve, reject) => {
    try {
      let userData = new XMLHttpRequest();
      userData.open("GET", `${baseURL}/userData`);
      userData.responseType = "json";
      userData.send();
      userData.onload = function () {
        resolve(userData.response);
      };
      userData.onerror = function () {
        reject("Error occured!");
      };
    } catch (e) {
      reject("Following error occured: e");
    }
  });
};

export let loadInventory = () => {
  return new Promise((resolve, reject) => {
    try {
      let inventory = new XMLHttpRequest();
      inventory.open("GET", `${baseURL}/inventory`);
      inventory.responseType = "json";
      inventory.send();
      inventory.onload = function () {
        resolve(inventory.response);
      };
      inventory.onerror = function () {
        reject("Error occured!");
      };
    } catch (e) {
      reject("Following error occured: e");
    }
  });
};

export let updateUserData = (data) => {
  let userDataUpd = new XMLHttpRequest();
  userDataUpd.open("PUT", `/user-data-update`);
  userDataUpd.setRequestHeader("Content-Type", "application/json");
  userDataUpd.send(JSON.stringify(data));
};

export let updateInventory = (data) => {
  let InventoryUpd = new XMLHttpRequest();
  InventoryUpd.open("PUT", `/inventory-update`);
  InventoryUpd.setRequestHeader("Content-Type", "application/json");
  InventoryUpd.send(JSON.stringify(data));
};
