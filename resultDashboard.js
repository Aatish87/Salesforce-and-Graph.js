import { LightningElement, api } from 'lwc';
import getCalculationRecords from '@salesforce/apex/resultTableController.getRelatedCalculationRecords';

export default class OpportunityBarChart extends LightningElement {

    //used to store initial results
    @api paramValue;
    goodPackData = [];
    competitorData = [];
    stackedGoodPackData = [];
    stackedCompetitorData = [];
    tempGoodpackMap = new Map();
    tempCompetitorMap = new Map();
    tempGpMap = new Map();
    tempCmpMap = new Map();
    // finalGpMap = new Map();
    // finalCmpMap = new Map();
    tempGpValue;
    tempCmpValue;

    //used to render different charts
    LCIAresultChartConfiguration;
    GlobalConfiguration;
    OzoneConfiguration;
    FineParticulateConfiguration;
    TerrestrialConfiguration;
    FreshwaterConfiguration;
    LandConfiguration;
    MineralConfiguration;
    FossilConfiguration;
    WaterConfiguration;

    //used to store the value of products in stacked-bar chart
    tempRawMaterial = [];
    tempPackaging = [];
    tempDistribution = [];
    tempUsePhase = [];
    tempCollection = [];
    tempEol = [];

    //used to show the total of each bar in stacked-bar chart
    globalGoodpackTotal = 0.0;
    globalMetaldrumTotal = 0.0;
    ozoneGoodpackTotal = 0.0;
    ozoneMetaldrumTotal = 0.0;
    fineGoodpackTotal = 0.0;
    fineMetaldrumTotal = 0.0;
    terrestrialGoodpackTotal = 0.0;
    terrestrialMetaldrumTotal = 0.0;
    freshwaterGoodpackTotal = 0.0;
    freshwaterMetaldrumTotal = 0.0;
    landGoodpackTotal = 0.0;
    landMetaldrumTotal = 0.0;
    mineralGoodpackTotal = 0.0;
    mineralMetaldrumTotal = 0.0;
    fossilGoodpackTotal = 0.0;
    fossilMetaldrumTotal = 0.0;
    waterGoodpackTotal = 0.0;
    waterMetaldrumTotal = 0.0;

    //used to loop for LICA results bar chart
    labels = ['Global warming',
        'Ozone formation, Human health',
        'Fine particulate matter formation',
        'Terrestrial acidification',
        'Freshwater eutrophication',
        'Land use',
        'Mineral resource scarcity',
        'Fossil resource scarcity',
        'Water consumption'
    ];

    //used in stacked-bar chart
    chartLabels = ['RawMaterialsManufacturingTool',
        'PackingAccessoryTool',
        'DistributionToPackerTool',
        'UsePhaseTool',
        'CollectionReconditioningTool',
        'EoLContainerTool'
    ];

    GoodpackLabel;
    CompetitorLabel;
    calculationName;
    calculationDate;
    tradeLane;
    tradeLaneOriginCountry;
    tradeLaneDestinationCountry
    fromCountry;
    toCountry;
    productName;
    producWeight;
    ifResult = false;

    connectedCallback() {

        getCalculationRecords({ carbonCalculatorId: this.paramValue })
            .then(result => {
                console.log('tradeLane : ', result.calTradelane);
                this.ifResult = true;
                this.GoodpackLabel = result.GoodpackLabel;
                this.CompetitorLabel = result.CompetitorLabel;
                this.calculationName = result.calName;
                this.calculationDate = result.calDate;
                this.tradeLane = result.calTradelane;
                this.tradeLaneOriginCountry = result.calTradelaneOriginCountry;
                this.tradeLaneDestinationCountry = result.calTradelaneDestinationCountry;
                this.fromCountry = result.calFromCountry;
                this.toCountry = result.calToCountry;
                this.productName = result.calProduct;
                this.producWeight = result.calProductWeight.toLocaleString();
                // nfObject = new Intl.NumberFormat('en-US'); 
                // this.producWeight = nfObject.format(this.producWeight); 
                this.fillData(result);
                this.setLCIAresultChartConfiguration();

                this.fillStackedData(result, 'Global warming');
                this.setGlobalConfiguration();
                this.fillStackedData(result, 'Ozone formation, Human health');
                this.setOzoneConfiguration();
                this.fillStackedData(result, 'Fine particulate matter formation');
                this.setFineParticulateConfiguration();
                this.fillStackedData(result, 'Terrestrial acidification');
                this.setTerrestrialConfiguration();
                this.fillStackedData(result, 'Freshwater eutrophication');
                this.setFreshwaterConfiguration();
                this.fillStackedData(result, 'Land use');
                this.setLandConfiguration();
                this.fillStackedData(result, 'Mineral resource scarcity');
                this.setMineralConfiguration();
                this.fillStackedData(result, 'Fossil resource scarcity');
                this.setFossilConfiguration();
                this.fillStackedData(result, 'Water consumption');
                this.setWaterConfiguration();

                console.log('goodpack data== ' + JSON.stringify(this.goodPackData));
                console.log('competitor data== ' + JSON.stringify(this.competitorData));
                // console.log('stacked goodpack data== ' + JSON.stringify(this.stackedGoodPackData));
                // console.log('stacked competitor data== ' + JSON.stringify(this.stackedCompetitorData));

            })
            .catch(error => {
                this.error = error;
                console.log('error== ' + JSON.stringify(this.error));
                this.LCIAresultChartConfiguration = undefined;

                this.GlobalConfiguration = undefined;
                this.OzoneConfiguration = undefined;
                this.FineParticulateConfiguration = undefined;
                this.TerrestrialConfiguration = undefined;
                this.FreshwaterConfiguration = undefined;
                this.LandConfiguration = undefined;
                this.MineralConfiguration = undefined;
                this.FossilConfiguration = undefined;
                this.WaterConfiguration = undefined;
            })

    }

    fillData(result) {
        //fill temp data map that will be used to convert the values in percentage
        this.tempGpMap = new Map();
        this.tempCmpMap = new Map();
        this.finalGpMap = new Map();
        this.finalCmpMap = new Map();
        result.gpWrapper.forEach(ele => {
            this.labels.forEach(label => {
                if (ele.ImpactCategory === label) {
                    if (!this.tempGpMap.has(label)) {
                        this.tempGpMap.set(label, ele.Total);
                    }
                    if (!this.finalGpMap.has(ele.Total)) {
                        this.finalGpMap.set(ele.Total, 0);
                    }
                    //this.goodPackData.push(ele.Total);
                }
            });
        });
        result.cmpWrapper.forEach(ele => {
            this.labels.forEach(label => {
                if (ele.ImpactCategory === label) {
                    if (!this.tempCmpMap.has(label)) {
                        this.tempCmpMap.set(label, ele.Total);
                    }
                    if (!this.finalCmpMap.has(ele.Total)) {
                        this.finalCmpMap.set(ele.Total, 0);
                    }
                    //this.competitorData.push(ele.Total);
                }
            });
        });

        //Calculate percentage and fill dataList
        this.labels.forEach(label => {
            this.tempGpValue = 0.0;
            this.tempCmpValue = 0.0;

            if (this.tempGpMap.has(label)) {
                this.tempGpValue = parseFloat(this.tempGpMap.get(label));
            }
            if (this.tempCmpMap.has(label)) {
                this.tempCmpValue = parseFloat(this.tempCmpMap.get(label));
            }

            let highestValue = this.tempGpValue >= this.tempCmpValue ? this.tempGpValue : this.tempCmpValue;
            let gpPerc = Math.round(((this.tempGpValue / highestValue) * 100).toFixed(2));
            let cmpPerc = Math.round(((this.tempCmpValue / highestValue).toFixed(2) * 100).toFixed(2));
            
            this.goodPackData.push(gpPerc);
            this.competitorData.push(cmpPerc);
        });

    }

    fillStackedData(result, impactCategory) {
        this.tempRawMaterial = [];
        this.tempPackaging = [];
        this.tempDistribution = [];
        this.tempUsePhase = [];
        this.tempCollection = [];
        this.tempEol = [];
        this.tempGoodpackMap = new Map();
        this.tempCompetitorMap = new Map();

        result.gpWrapper.forEach(ele => {
            if (ele.ImpactCategory === impactCategory) {
                for (const key in ele) {
                    if (this.chartLabels.includes(key)) {
                        if (this.tempGoodpackMap.has(key)) {
                            let tempValue = parseFloat(this.tempGoodpackMap.get(key));

                            let tempValue2 = parseFloat(ele[key]);
                            let tempfinal = tempValue + tempValue2;
                            this.tempGoodpackMap.set(key, tempfinal);

                        } else {
                            let tempValue2 = parseFloat(ele[key]);
                            this.tempGoodpackMap.set(key, tempValue2);

                        }
                    }
                }
            }
        });

        result.cmpWrapper.forEach(ele => {
            if (ele.ImpactCategory === impactCategory) {
                for (const key in ele) {
                    if (this.chartLabels.includes(key)) {
                        if (this.tempCompetitorMap.has(key)) {
                            let tempValue = parseFloat(this.tempCompetitorMap.get(key));
                            let tempValue2 = parseFloat(ele[key]);
                            let tempfinal = tempValue + tempValue2;
                            this.tempCompetitorMap.set(key, tempfinal);
                        } else {
                            let tempValue2 = parseFloat(ele[key]);
                            this.tempCompetitorMap.set(key, tempValue2);
                        }
                    }
                }
            }
        });

        let index = 0;
        this.chartLabels.forEach(label => {
            if (index === 0) {
                this.tempRawMaterial.push(this.tempGoodpackMap.get(label));
                this.tempRawMaterial.push(this.tempCompetitorMap.get(label));
            } else if (index === 1) {
                this.tempPackaging.push(this.tempGoodpackMap.get(label));
                this.tempPackaging.push(this.tempCompetitorMap.get(label));
            } else if (index === 2) {
                this.tempDistribution.push(this.tempGoodpackMap.get(label));
                this.tempDistribution.push(this.tempCompetitorMap.get(label));
            } else if (index === 3) {
                this.tempUsePhase.push(this.tempGoodpackMap.get(label));
                this.tempUsePhase.push(this.tempCompetitorMap.get(label));
            } else if (index === 4) {
                this.tempCollection.push(this.tempGoodpackMap.get(label));
                this.tempCollection.push(this.tempCompetitorMap.get(label));
            } else if (index === 5) {
                this.tempEol.push(this.tempGoodpackMap.get(label));
                this.tempEol.push(this.tempCompetitorMap.get(label));
            }
            index++;
        });
    }

    setLCIAresultChartConfiguration() {
        this.LCIAresultChartConfiguration = {
            type: 'bar',
            data: {
                labels: this.labels,
                datasets: [
                    { label: this.GoodpackLabel, backgroundColor: 'blue', data: this.goodPackData },
                    { label: this.CompetitorLabel, backgroundColor: 'orange', data: this.competitorData }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    yAxes: [{
                        scaleLabel: { display: true, labelString: '%' }
                    }]
                }
            }
        };
    }

    setGlobalConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.globalGoodpackTotal = a.toFixed(2);
        this.globalMetaldrumTotal = b.toFixed(2);

        this.GlobalConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg CO2 eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setOzoneConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.ozoneGoodpackTotal = a.toFixed(2);
        this.ozoneMetaldrumTotal = b.toFixed(2);

        this.OzoneConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg NOx eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setFineParticulateConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.fineGoodpackTotal = a.toFixed(2);
        this.fineMetaldrumTotal = b.toFixed(2);

        this.FineParticulateConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg PM2.5 eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setTerrestrialConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.terrestrialGoodpackTotal = a.toFixed(2);
        this.terrestrialMetaldrumTotal = b.toFixed(2);

        this.TerrestrialConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg SO2 eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setFreshwaterConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.freshwaterGoodpackTotal = a.toFixed(2);
        this.freshwaterMetaldrumTotal = b.toFixed(2);

        this.FreshwaterConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg P eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setLandConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.landGoodpackTotal = a.toFixed(2);
        this.landMetaldrumTotal = b.toFixed(2);

        this.LandConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life Container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'm2a crop eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setMineralConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.mineralGoodpackTotal = a.toFixed(2);
        this.mineralMetaldrumTotal = b.toFixed(2);

        this.MineralConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life Container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg Cu eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setFossilConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.fossilGoodpackTotal = a.toFixed(2);
        this.fossilMetaldrumTotal = b.toFixed(2);

        this.FossilConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'kg oil eq.' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

    setWaterConfiguration() {
        let a = this.tempRawMaterial[0] + this.tempPackaging[0] + this.tempDistribution[0] + this.tempUsePhase[0] + this.tempCollection[0] + this.tempEol[0];
        let b = this.tempRawMaterial[1] + this.tempPackaging[1] + this.tempDistribution[1] + this.tempUsePhase[1] + this.tempCollection[1] + this.tempEol[1];
        this.waterGoodpackTotal = a.toFixed(2);
        this.waterMetaldrumTotal = b.toFixed(2);

        this.WaterConfiguration = {
            type: 'bar',
            data: {
                labels: [this.GoodpackLabel, this.CompetitorLabel],
                datasets: [
                    { label: 'Raw materials & Manufacturing', data: this.tempRawMaterial, backgroundColor: 'orange' },
                    { label: 'Packaging accessories', data: this.tempPackaging, backgroundColor: 'yellow' },
                    { label: 'Distribution to packer', data: this.tempDistribution, backgroundColor: 'teal' },
                    { label: 'Use phase', data: this.tempUsePhase, backgroundColor: 'grey' },
                    { label: 'Collection & Reconditioning', data: this.tempCollection, backgroundColor: 'green' },
                    { label: 'End of life container', data: this.tempEol, backgroundColor: 'blue' }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{ stacked: true, barPercentage: 0.4 }],
                    yAxes: [{
                        stacked: true, barPercentage: 0.4,
                        scaleLabel: { display: true, labelString: 'm3' }
                    }]
                },
                legend: { display: true },
                tooltips: { enabled: true }
            }
        };
    }

}