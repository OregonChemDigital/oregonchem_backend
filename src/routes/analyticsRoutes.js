const express = require('express');
const { googleAuth, analyticsDataClient, verifyToken } = require('../config/firebaseAdmin');
const router = express.Router();

// Apply authentication middleware to all analytics routes
// router.use(verifyToken); // Temporarily disabled due to Firebase config issues

// List of all sites (current and future)
const SITES = {
    quimicaindustrial: {
        name: 'Química Industrial',
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID_QUIMICAINDUSTRIAL,
        firebaseApp: 'quimicaindustrial-web', // Firebase app name
        // Add other site-specific configurations here
    },
    // Future sites (commented out for now)
    /*
    site2: {
        name: 'Site 2',
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID_SITE2,
        firebaseApp: 'site2-web',
    },
    site3: {
        name: 'Site 3',
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID_SITE3,
        firebaseApp: 'site3-web',
    },
    site4: {
        name: 'Site 4',
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID_SITE4,
        firebaseApp: 'site4-web',
    },
    site5: {
        name: 'Site 5',
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID_SITE5,
        firebaseApp: 'site5-web',
    }
    */
};

// Helper function to fetch analytics data for a specific property
const fetchAnalyticsData = async (propertyId) => {
    const formattedPropertyId = `properties/${propertyId}`;
    const response = await analyticsDataClient.properties.runReport({
        property: formattedPropertyId,
        auth: await googleAuth.getClient(),
        requestBody: {
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
                { name: 'sessions' },
                { name: 'activeUsers' },
                { name: 'screenPageViews' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' }
            ],
            dimensions: [{ name: 'date' }],
        },
    });
    return response.data;
};

// Helper function to fetch custom events data
const fetchCustomEvents = async (propertyId) => {
    const formattedPropertyId = `properties/${propertyId}`;
    
    try {
        const response = await analyticsDataClient.properties.runReport({
            property: formattedPropertyId,
            auth: await googleAuth.getClient(),
            requestBody: {
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                metrics: [{ name: 'eventCount' }],
                dimensions: [
                    { name: 'eventName' },
                    { name: 'date' }
                ],
                dimensionFilter: {
                    orGroup: {
                        expressions: [
                            {
                                filter: {
                                    fieldName: 'eventName',
                                    stringFilter: {
                                        matchType: 'CONTAINS',
                                        value: 'cotizar'
                                    }
                                }
                            },
                            {
                                filter: {
                                    fieldName: 'eventName',
                                    stringFilter: {
                                        matchType: 'CONTAINS',
                                        value: 'quote'
                                    }
                                }
                            },
                            {
                                filter: {
                                    fieldName: 'eventName',
                                    stringFilter: {
                                        matchType: 'CONTAINS',
                                        value: 'wishlist'
                                    }
                                }
                            },
                            {
                                filter: {
                                    fieldName: 'eventName',
                                    stringFilter: {
                                        matchType: 'CONTAINS',
                                        value: 'navbar'
                                    }
                                }
                            }
                        ]
                    }
                },
                orderBys: [
                    {
                        dimension: {
                            dimensionName: 'date',
                            orderType: 'NUMERIC'
                        }
                    }
                ]
            },
        });

        if (!response.data.rows || response.data.rows.length === 0) {
            const simpleResponse = await analyticsDataClient.properties.runReport({
                property: formattedPropertyId,
                auth: await googleAuth.getClient(),
                requestBody: {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    metrics: [{ name: 'eventCount' }],
                    dimensions: [{ name: 'eventName' }]
                },
            });
            return simpleResponse.data;
        }

        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch custom events: ${error.message}`);
    }
};

// Endpoint to fetch analytics data for a specific site
router.get('/:siteId/overview', async (req, res) => {
    try {
        const { siteId } = req.params;
        const site = SITES[siteId];

        if (!site) {
            return res.status(404).json({ message: `Site ${siteId} not found` });
        }

        if (!site.propertyId) {
            console.error(`Google Analytics Property ID for ${site.name} is not configured`);
            return res.status(400).json({ 
                message: `Google Analytics Property ID for ${site.name} is not configured`,
                details: 'Please check your environment variables and ensure GOOGLE_ANALYTICS_PROPERTY_ID_QUIMICAINDUSTRIAL is set'
            });
        }

        try {
            const data = await fetchAnalyticsData(site.propertyId);
            
            if (!data || !data.rows || data.rows.length === 0) {
                return res.status(200).json({
                    siteName: site.name,
                    totalSessions: 0,
                    todaySessions: 0,
                    activeUsers: 0,
                    totalPageViews: 0,
                    todayPageViews: 0,
                    conversionRate: 0,
                    mostViewedProduct: 'No data available',
                    mostQuotedProduct: 'No data available'
                });
            }
            
            const totalSessions = data.rows.reduce((sum, row) => sum + parseInt(row.metricValues[0].value), 0);
            const totalPageViews = data.rows.reduce((sum, row) => sum + parseInt(row.metricValues[2].value), 0);
            const todayData = data.rows[data.rows.length - 1];
            
            const homepageViews = data.rows.reduce((sum, row) => {
                if (row.dimensionValues[0].value.includes('homepage')) {
                    return sum + parseInt(row.metricValues[2].value);
                }
                return sum;
            }, 0);
            
            const quoteSubmissions = data.rows.reduce((sum, row) => {
                if (row.dimensionValues[0].value.includes('quote_form_submission')) {
                    return sum + parseInt(row.metricValues[0].value);
                }
                return sum;
            }, 0);
            
            const conversionRate = homepageViews > 0 ? ((quoteSubmissions / homepageViews) * 100).toFixed(2) : 0;

            res.json({
                siteName: site.name,
                totalSessions,
                todaySessions: todayData.metricValues[0].value,
                activeUsers: todayData.metricValues[1].value,
                totalPageViews,
                todayPageViews: todayData.metricValues[2].value,
                conversionRate,
                mostViewedProduct: 'Product A',
                mostQuotedProduct: 'Product B'
            });
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            return res.status(500).json({ 
                message: 'Error fetching analytics data', 
                error: error.message,
                details: 'Please check your Google Analytics configuration and ensure the service account has the necessary permissions'
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            message: 'Unexpected error occurred', 
            error: error.message
        });
    }
});

// Endpoint to fetch combined analytics data for all sites
router.get('/combined/overview', async (req, res) => {
    try {
        const combinedData = {
            totalSessions: 0,
            totalActiveUsers: 0,
            totalPageViews: 0,
            sites: {}
        };

        for (const [siteId, site] of Object.entries(SITES)) {
            if (!site.propertyId) continue;

            try {
                const siteData = await fetchAnalyticsData(site.propertyId);
                const todayData = siteData.rows[siteData.rows.length - 1];

                combinedData.totalSessions += parseInt(todayData.metricValues[0].value);
                combinedData.totalActiveUsers += parseInt(todayData.metricValues[1].value);
                combinedData.totalPageViews += parseInt(todayData.metricValues[2].value);

                combinedData.sites[siteId] = {
                    name: site.name,
                    sessions: parseInt(todayData.metricValues[0].value),
                    activeUsers: parseInt(todayData.metricValues[1].value),
                    pageViews: parseInt(todayData.metricValues[2].value)
                };
            } catch (error) {
                console.error(`Error fetching data for site ${siteId}:`, error);
            }
        }

        res.json(combinedData);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching combined analytics data', 
            error: error.message
        });
    }
});

// Endpoint to fetch custom events data for a specific site
router.get('/:siteId/events', async (req, res) => {
    try {
        const { siteId } = req.params;
        const site = SITES[siteId];

        if (!site) {
            throw new Error(`Site ${siteId} not found`);
        }

        if (!site.propertyId) {
            throw new Error(`Google Analytics Property ID for ${site.name} is not configured`);
        }

        const data = await fetchCustomEvents(site.propertyId);
        
        // Process the events data
        const events = {};
        if (data && data.rows && Array.isArray(data.rows)) {
            data.rows.forEach(row => {
                const eventName = row.dimensionValues[0].value;
                const count = parseInt(row.metricValues[0].value);
                events[eventName] = (events[eventName] || 0) + count;
            });
        } else {
            console.warn('No events data found in response:', JSON.stringify(data, null, 2));
        }

        // Format the response to match the dashboard requirements
        const formattedEvents = {
            hero_cotizar_click: events['hero_cotizar_click'] || 0,
            featured_cotizar_click: events['featured_cotizar_click'] || 0,
            wishlist_cotizar_click: events['wishlist_cotizar_click'] || 0,
            navbar_cotizar_click: events['navbar_cotizar_click'] || 0,
            wishlist_popup_open: events['wishlist_popup_open'] || 0,
            navbar_productos_click: events['navbar_productos_click'] || 0,
            // Add any other events we find
            ...events
        };

        res.json(formattedEvents);
    } catch (error) {
        console.error('Error fetching custom events data:', error);
        res.status(500).json({ 
            message: 'Error fetching custom events data', 
            error: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

module.exports = router;

