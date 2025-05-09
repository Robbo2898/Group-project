let totalIncome = 0;
let totalExpenses = 0;
let recurringPayments = [];
let expenseLabels = [];
let expenseValues = [];
let selectedIncomeCategory = '';
let chartInstance = null;

function selectIncome(category) {
  selectedIncomeCategory = category;
  clearSelectedButtons('income-buttons');
  const buttons = document.getElementById('income-buttons').children;
  for (let btn of buttons) {
    if (btn.textContent.includes(category)) {
      btn.classList.add('selected-btn');
    }
  }
}

function clearSelectedButtons(groupId) {
  const buttons = document.getElementById(groupId).children;
  for (let btn of buttons) {
    btn.classList.remove('selected-btn');
  }
}

function addIncome() {
  const amount = parseFloat(document.getElementById('income-amount').value);

  if (!selectedIncomeCategory) {
    alert("Please select an income category.");
    return;
  }

  if (!isNaN(amount) && amount > 0) {
    totalIncome += amount;
    document.getElementById('income-list').innerHTML += `<li>${selectedIncomeCategory}: £${amount.toFixed(2)}</li>`;
    updateSummary();
  } else {
    alert("Please enter a valid income amount.");
  }

  document.getElementById('income-amount').value = '';
  selectedIncomeCategory = '';
  clearSelectedButtons('income-buttons');
}

function addExpense() {
  const amount = parseFloat(document.getElementById('expense-amount').value);
  if (!isNaN(amount) && amount > 0) {
    const category = prompt("Enter expense category (e.g., Food, Rent):");
    if (category) {
      totalExpenses += amount;
      document.getElementById('expense-list').innerHTML += `<li>${category}: £${amount.toFixed(2)}</li>`;
      addToExpenseChart(category, amount);
      updateSummary();
    }
  } else {
    alert("Please enter a valid expense amount.");
  }
  document.getElementById('expense-amount').value = '';
}

function addRecurringPayment() {
  const name = document.getElementById('recurring-name').value;
  const amount = parseFloat(document.getElementById('recurring-amount').value);
  const date = document.getElementById('recurring-date').value;

  if (name && !isNaN(amount) && amount > 0 && date) {
    recurringPayments.push({ name, amount, date });
    document.getElementById('recurring-list').innerHTML += `<li>${name}: £${amount.toFixed(2)} on ${date}</li>`;
  } else {
    alert("Please enter all recurring payment details.");
  }

  document.getElementById('recurring-name').value = '';
  document.getElementById('recurring-amount').value = '';
  document.getElementById('recurring-date').value = '';
}

function updateSummary() {
  document.getElementById('total-income').textContent = totalIncome.toFixed(2);
  document.getElementById('total-expenses').textContent = totalExpenses.toFixed(2);
  document.getElementById('balance').textContent = (totalIncome - totalExpenses).toFixed(2);
}

function addToExpenseChart(category, amount) {
  const index = expenseLabels.indexOf(category);
  if (index > -1) {
    expenseValues[index] += amount;
  } else {
    expenseLabels.push(category);
    expenseValues.push(amount);
  }
  renderChart();
}

function renderChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: expenseLabels,
      datasets: [{
        data: expenseValues,
        backgroundColor: ['#4CAF50', '#FF9800', '#03A9F4', '#E91E63', '#9C27B0', '#FFC107'],
        borderColor: '#111',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            font: { size: 14, family: 'Nunito' }
          }
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const value = tooltipItem.raw;
              const total = expenseValues.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              return `${tooltipItem.label}: £${value.toFixed(2)} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}
