// import {Chart} from "/node_modules/dist/chart.js";
import {FilterTools} from "./filterTools.js";
import {Sidebar} from "./sidebar";

export class Main {
    constructor() {
        this.elementIncomeChart = null;
        this.elementExpenseChart = null;
        this.dataIncomeChart = [];
        this.dataExpenseChart = [];

        this.init();
    }

    async init() {
        document.getElementById('category_main').classList.add('active');
        await FilterTools.getFilterTools(this.buildChart.bind(this));
        // await Sidebar.setBalance();
    }

    updateChart(elementChart, data) {
        elementChart.data.datasets[0].data = data.map(row => row.amount);
        elementChart.data.labels = data.map(row => row.category);
        elementChart.update();
    }

    createChart(data, title, ctx) {
        const dataObj = {
            labels: data.map(row => row.category),
            datasets: [
                {
                    label: title,
                    data: data.map(row => row.amount),
                    borderWidth: 1
                }
            ]
        };
        return new Chart(ctx, {
            type: 'pie',
            data: dataObj,
            options: {
                radius: 180,
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    colors: {
                        forceOverride: true
                    },
                }
            },
        });
    }

    getDataForChart(dataChart, operation) {
        let categoryObj = dataChart.find(item => item.category === operation.category);
        if (categoryObj) {
            categoryObj.amount += +operation.amount;
        } else {
            dataChart.push({
                category: operation.category,
                amount: +operation.amount
            })
        }
    }

    buildChart() {
        this.dataIncomeChart = [];
        this.dataExpenseChart = [];
        FilterTools.operations.forEach(operation => {
            if (operation.type === 'expense') {
                this.getDataForChart(this.dataExpenseChart, operation);
            } else {
                this.getDataForChart(this.dataIncomeChart, operation);
            }
        })
        if (this.elementIncomeChart) {
            this.updateChart(this.elementIncomeChart, this.dataIncomeChart)
        } else {
            this.elementIncomeChart = this.createChart(this.dataIncomeChart, 'Income', $('#chartIncome'));
        }

        if (this.elementExpenseChart) {
            this.updateChart(this.elementExpenseChart, this.dataExpenseChart)
        } else {
            this.elementExpenseChart = this.createChart(this.dataExpenseChart, 'Expense', $('#chartExpense'));
        }
    }

}
