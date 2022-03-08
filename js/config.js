'use strict';
(
    function () {
        let defaultSettings = {
            'lgSettings': {},
            'data': { 'sheet': '', 'field': '' }
        };
        $(document).ready(function () {
            tableau.extensions.initializeDialogAsync().then(function (openPayload) {
                if (openPayload)
                    defaultSettings = JSON.parse(openPayload);
                let lgSettings = defaultSettings.lgSettings;
                Object.keys(lgSettings).forEach(element => {
                    if ($("#" + element).is(':checkbox'))
                        $("#" + element).attr('checked', lgSettings[element]);
                    else
                        $("#" + element).val(lgSettings[element]);
                });
                console.log(defaultSettings);
                var dashboard = tableau.extensions.dashboardContent.dashboard;
                var worksheets = dashboard.worksheets;
                $("#sWorksheets").empty();
                $("#sWorksheets").append("<option value=''>Select</option>");
                $("#sFields").empty();
                $("#sFields").append("<option value=''>Select</option>");
                worksheets.forEach((worksheet) => {
                    $("#sWorksheets").append("<option value='" + worksheet.name + "'>" + worksheet.name + "</option>");
                })
                $("#sWorksheets option[value='" + defaultSettings.data.sheet + "']").prop('selected', true);
                $('#closeButton').click(closeDialog);
                $("#sWorksheets").change(workSheetChange);
                $("#sWorksheets").change();
            });
        });
        function workSheetChange() {
            $("#sFields").empty();
            $("#sFields").append("<option value=''>Select</option>");
            defaultSettings.data.sheet = $("#sWorksheets").val()
            var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
            var worksheet = worksheets.find((sheet) => {
                if (sheet.name === defaultSettings.data.sheet) {
                    sheet.getSummaryDataAsync({ maxRows: 1 }).then((sumdata) => {
                        sumdata.columns.forEach((v) => {
                            if (defaultSettings.data.field == v.fieldName)
                                $("#sFields").append("<option value='" + v.fieldName + "' selected>" + v.fieldName + "</option>");
                            else
                                $("#sFields").append("<option value='" + v.fieldName + "'>" + v.fieldName + "</option>");
                        });
                    });
                }
            });
        }
        function closeDialog() {
            //defaultSettings.actualfield = $'#'
            let lgSettings = defaultSettings.lgSettings;
            Object.keys(lgSettings).forEach(element => {
                if ($("#" + element).is(':checkbox'))
                    lgSettings[element] = $("#" + element).is(':checked')?true:false;
                else
                    lgSettings[element] = $("#" + element).val();
            });
            defaultSettings.data.sheet = $("#sWorksheets").val()
            defaultSettings.data.field = $("#sFields").val()
            defaultSettings.lgSettings = lgSettings;
            tableau.extensions.settings.set('lg_settings', JSON.stringify(defaultSettings));
            let ds = JSON.stringify(defaultSettings)
            tableau.extensions.settings.saveAsync().then((newds) => {
                tableau.extensions.ui.closeDialog(ds);
            });
        }
    }
)();