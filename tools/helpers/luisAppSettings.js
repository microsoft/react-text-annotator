/**
 * Copyright (c) Microsoft. All rights reserved.
 */

/**
 * Generates app settings for the development environment
 * when running locally and when running tests.
 */
const getLuisAppSettings = () => {
    return {
        isProduction: false,
        defaultRegion: 'westus',
        featureToggles: {
            LuisSurvey: true,
            CluMigration: false,
            ModelGuidance: true,
            CancelTraining: true,
            QnaPairDetais: false,
            ModelLifeCycle: false,
            MaintenanceMode: false,
            EnableCustomSkills: true
        },
        azureBaseUrl: 'https://management.azure.com'
    };
};

exports.getLuisAppSettings = getLuisAppSettings;
