window.addEventListener("hashchange", showPage);
window.addEventListener("load", () => {
    showPage();
    displayBudgets();
});

function showPage() {
    const hash = location.hash.slice(1);

    document.querySelectorAll(".content").forEach(content => {
        content.style.display = "none";
    });
    if(hash === "summary") {
        displayBudgets();
        if(document.getElementById('plot-year').value){
            displayBarPlot();
        }
    };

    document.getElementById(hash).style.display = "block";
}

async function addTransaction() {
    const form = document.getElementById('createRecordForm');
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const year = date.split("-")[0];
    const month = date.split("-")[1].charAt(0) === '0' ? date.split("-")[1].charAt(1) : date.split("-")[1];
    const notes = document.getElementById("notes").value;
    
    const transaction = {
        "Category": category,
        "Amount": amount,
        "Date": date,
        "Year": year,
        "Month": month,
        "Notes": notes
    };

    const response = await fetch('https://financial-app-project-2-05e72f78446b.herokuapp.com/api/addTransaction', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction) 
    });
    
    form.reset();
    displayTransactions()
}

async function displayTransactions(){
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const response = await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/getTransactions?Year=${year}&Month=${month}`, {
        method: 'GET'
    });
    const data = await response.json();
    const tbody = document.querySelector(".recordsTable").querySelector("tbody");
    tbody.innerHTML = "";

    for(const transaction of data) {
        const row = document.createElement("tr");
        ["Category", "Amount", "Date", "Notes"].forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = transaction[key];
            row.appendChild(cell);
        })

        const editCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editTransaction(transaction._id);
        editCell.appendChild(editButton);
        row.appendChild(editCell);

        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteTransaction(transaction._id);
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tbody.appendChild(row);
    }
}

async function deleteTransaction(id){
    await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/deleteTransaction?Id=${id}`, {method: 'GET'});
    displayTransactions();
}

let transactionId;

async function editTransaction(id){
    document.getElementById("editModal").style.display = "block";
    response = await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/getTransactionById?Id=${id}`)
    const transaction = (await response.json())[0];
    const category = transaction.Category;
    const amount = transaction.Amount;
    const date = transaction.Date;
    const notes = transaction.Notes;

    const editCategory = document.getElementById('editCategory');
    const editAmount = document.getElementById('editAmount');
    const editDate = document.getElementById('editDate');
    const editNotes = document.getElementById('editNotes');

    editCategory.value = category;
    editAmount.value = amount;
    editDate.value = date;
    editNotes.value = notes;

    transactionId = id;
}

async function saveEditedRecord(){
    const category = document.getElementById('editCategory').value;
    const amount = document.getElementById('editAmount').value;
    const date = document.getElementById('editDate').value;
    const notes = document.getElementById('editNotes').value;
    
    const transaction = {
        "Id": transactionId,
        "Category": category,
        "Amount": amount,
        "Date": date,
        "Notes": notes
    }

    await fetch('https://financial-app-project-2-05e72f78446b.herokuapp.com/api/updateTransaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction) 
    });

    const editForm = document.getElementById('editRecordForm');
    editForm.reset();
    displayTransactions();
}   

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

async function setBudget(){
    const budgetForm = document.getElementById('budgetForm');
    const year = document.getElementById("budget-year").value;
    const month = document.getElementById("budget-month").value;
    const amount = document.getElementById("budget-amount").value;

    const response = await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/getTransactions?Year=${year}&Month=${month}`, {
        method: 'GET'
    });

    const data = await response.json();

    let total = 0;
    for (const transaction of data){
        total += parseInt(transaction.Amount);
    }

    const budget = {
        "Year": year,
        "Month": month,
        "Budget": amount,
        "Total": total,
        "Remaining": amount - total
    }

    // route
    await fetch('https://financial-app-project-2-05e72f78446b.herokuapp.com/api/setBudget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(budget) 
    });

    budgetForm.reset();
    displayBudgets();
}

// display all budget 
async function displayBudgets(){
    const response = await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/getBudgets`, {
        method: 'GET'
    });

    const data = await response.json();
    const tbody = document.querySelector(".budgetsTable").querySelector("tbody");
    tbody.innerHTML = "";

    for(const budget of data) {
        const row = document.createElement("tr");
        ["Year", "Month", "Budget", "Total", "Remaining"].forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = budget[key];
            row.appendChild(cell);
        })

        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteBudget(budget._id);
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tbody.appendChild(row);
    }
}

async function deleteBudget(budgetId){  
    console.log("budgetId: ", budgetId);
    await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/deleteBudget?Id=${budgetId}`, {method: 'GET'});
    displayBudgets();
}

async function displayBarPlot() {
    const year = document.getElementById('plot-year').value;
    
    const months = [
        'January', 'February', 'March', 'April', 'May',
        'June', 'July', 'August', 'September',
        'October', 'November', 'December'
    ];

    // Calculate total for each month
    let monthlyTotals = new Array(12).fill(0);

    const response = (await fetch(`https://financial-app-project-2-05e72f78446b.herokuapp.com/api/getBudgetsByYear?year=${year}`, {method: 'GET'}));
    const data = await response.json();

    data.forEach(budget => {
        const month = budget.Month;
        const monthIndex = parseInt(month) - 1;
        monthlyTotals[monthIndex] = budget.Total;
    });

    const ctx = document.getElementById('transactionChart').getContext('2d');
    const chart = Chart.getChart(ctx);
    if(chart) {
        chart.destroy();
    }
    ctx.canvas.width = ctx.canvas.width; 

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: `Total Transaction for ${year}`,
                data: monthlyTotals,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
