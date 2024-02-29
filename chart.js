import { LightningElement, api, track } from 'lwc';
import chartjs from '@salesforce/resourceUrl/ChartJS';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Chart extends LightningElement {

    // Public properties that can be set from parent components
    @api loaderVariant = 'base';
    @api chartConfig;

    // Private tracking variable to determine if ChartJS has been initialized
    @track isChartJsInitialized;

    // Callback that is triggered when the component is rendered on the UI
    renderedCallback() {

        // Check if ChartJS is already initialized, if yes, return
        if (this.isChartJsInitialized) {
            return;
        }

        // Load ChartJS script as a static resource
        Promise.all([loadScript(this, chartjs)])
            .then(() => {
                // Set the flag to indicate ChartJS is initialized
                this.isChartJsInitialized = true;

                // Get the canvas context and initialize the Chart using the provided configuration
                const ctx = this.template.querySelector('canvas.barChart').getContext('2d');
                this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfig)));

                // Set styles for the chart container
                this.chart.canvas.parentNode.style.height = 'auto';
                this.chart.canvas.parentNode.style.width = '80%';
            })
            .catch(error => {
                // Display an error toast if there is an issue loading ChartJS
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error',
                    })
                );
            });
    }

}
