'use strict';

(
    function () {
        let unregisterHandlerFunctions = [];
        let lgSettings = { 'lgSettings': liquidFillGaugeDefaultSettings(), 'data': {} };
        $(document).ready(function () {
            tableau.extensions.initializeAsync({ 'configure': configure }).then(function () {
                const dashboard = tableau.extensions.dashboardContent.dashboard;
                
                unregisterHandlerFunctions.forEach(function (unregisterHandlerFunction) {
                    unregisterHandlerFunction();
                });
                dashboard.worksheets.forEach(function (worksheet) {
                    const unregisterFilterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged,
                        (filterEvent) => {
                            renderChart()
                        });
                    const unregisterMarkHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged,
                        (filterEvent) => {
                            renderChart()
                        });
                    unregisterHandlerFunctions.push(unregisterFilterHandlerFunction);
                    unregisterHandlerFunctions.push(unregisterMarkHandlerFunction);
                });
                
                let lgs = tableau.extensions.settings.get('lg_settings');
                if (!lgs)
                    lgSettings = { 'lgSettings': liquidFillGaugeDefaultSettings(), 'data': {} };
                else
                    lgSettings = JSON.parse(lgs)

                renderChart()
            })
        })
        function renderChart() {
            const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
            worksheets.find((sheet) => {
                if (sheet.name === lgSettings.data.sheet) {
                    sheet.getSummaryDataAsync().then(
                        dt => {
                            var idx = dt.columns.findIndex(s => s.fieldName == lgSettings.data.field)
                            loadLiquidFillGauge("gauge", dt.data[0][idx].value, lgSettings.lgSettings);
                        }
                    )
                }
            })
        }
        function configure() {
            const popupUrl = `${window.location.origin}/tab-ext-liquidfillgauge/config.html`;
            tableau.extensions.ui
                .displayDialogAsync(popupUrl, JSON.stringify(lgSettings), { height: 550, width: 700 })
                .then((closePayload) => {
                    let ds = JSON.parse(closePayload)
                    lgSettings = ds;
                    renderChart()
                })
                .catch((error) => {
                    switch (error.errorCode) {
                        case tableau.ErrorCodes.DialogClosedByUser:
                            console.log('Dialog was closed by user');
                            break;
                        default:
                            console.error(error.message);
                    }
                });
        }
    }
)();
