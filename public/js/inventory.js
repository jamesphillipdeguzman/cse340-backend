"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // Fetch all classifications

  fetch("/inv/classification/all")
    .then((response) => {
      if (response.ok) return response.json();

      throw new Error("Network response was not OK.");
    })
    .then((data) => {
      console.log("All classifications", data);
      buildClassificationList(data);
    })
    .catch((error) => {
      console.error("Error fetching classifications.", error);
    });

  // Get a list of items in inventory based on the classification_id

  let classificationList = document.querySelector("#classificationList");
  console.log("Dropdown element:", classificationList);

  classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);
    let classIdURL = "/inv/getInventory/" + classification_id;
    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw Error("Network response was not OK");
      })
      .then(function (data) {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(function (error) {
        console.log("There was a problem: ", error.message);
      });
  });

  // Build classification items into HTML table components and inject into DOM
  function buildClassificationList(data) {
    let classificationDisplay = document.getElementById(
      "classificationDisplay"
    );
    // Set up the table labels
    let dataTable = `
    <div class="classificationDiv">
    <table>
      <thead>
        <tr>
          <th>Classification Name</th>
         
        </tr>
      </thead>
      <tbody>
    `;

    data.forEach(function (element) {
      const inputId = `classification_name_${element.classification_id}`;
      dataTable += `
        <tr data-id="${element.classification_id}">
          <td>
            <label for="${inputId}" class="sr-only">${element.classification_name}</label>
            <input type="text" id="${inputId}" name="classification_name" value="${element.classification_name}" class="classification-input" />
          </td>
          <td>
            <button class="modify-btn">Modify</button>
          </td>
          <td>
            <button class="delete-btn">Delete</button>
          </td>
        </tr>
      `;
    });

    dataTable += `
        </tbody>
      </table>
    </div>
    `;
    classificationDisplay.innerHTML = dataTable;

    // Add event listeners for Modify buttons
    classificationDisplay.querySelectorAll(".modify-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const row = this.closest("tr");
        const id = row.dataset.id;
        const newName = row.querySelector(".classification-input").value;

        fetch(`/classification/edit/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classification_name: newName }),
        })
          .then((res) => {
            if (res.redirected) {
              window.location.href = res.url;
              return;
            }
            return res.json();
          })
          .then((data) => {
            alert(`Classification updated: ${data.classification_name}`);
            window.location.reload();
          })
          .catch((err) => console.error(err));
      });
    });

    // Add event listeners for Delete buttons
    classificationDisplay.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const row = this.closest("tr");
        const id = row.dataset.id;

        fetch(`/classification/delete/${id}`, {
          method: "DELETE",
        })
          .then((res) => {
            if (res.redirected) {
              window.location.href = res.url;
              return;
            }
            return res.json();
          })
          .then(() => {
            row.remove(); // Remove row from table
            window.location.reload();
          })
          .catch((err) => console.error(err));
      });
    });
  }

  // Build inventory items into HTML table components and inject into DOM
  function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay");
    // Set up the table labels

    let dataTable = `
      <div class="inventoryDisplayDiv">
        <table>
        <thead>
          <tr>
            <th>Vehicle Name</th>
          
          </tr>
        </thead>
        <tbody>
    `;

    // Iterate over all vehicles in the array and put each in a row
    data.forEach(function (element) {
      console.log("Element keys:", Object.keys(element), element);
      console.log(element.inv_id + ", " + element.inv_model);
      dataTable += `<tr><td>${element.inv_year} ${element.inv_make} ${element.inv_model}</td>`;
      dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
      dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
    });
    dataTable += `
          </tbody>
        </table>
      </div>
    `;
    // Display the contents in the Inventory Management view
    inventoryDisplay.innerHTML = dataTable;
  }
});
