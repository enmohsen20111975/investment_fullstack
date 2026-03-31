/**
 * Chart Module for EGX Investment Platform
 * Provides candlestick and line chart functionality using ApexCharts
 */

/**
 * Create a candlestick chart for stock price history
 * @param {string} containerId - The ID of the container element
 * @param {Array} historyData - Array of historical price data
 * @param {Object} options - Additional chart options
 * @returns {Object} ApexCharts instance
 */
export function createCandlestickChart(containerId, historyData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return null;
    }

    // Clear any existing chart
    container.innerHTML = '';

    // Transform data for ApexCharts candlestick format
    const candlestickData = historyData.map(item => ({
        x: item.date || item.datetime,
        y: [
            item.open,
            item.high,
            item.low,
            item.close
        ]
    }));

    const defaultOptions = {
        series: [{
            name: 'Price',
            data: candlestickData
        }],
        chart: {
            type: 'candlestick',
            height: 350,
            fontFamily: 'Cairo, sans-serif',
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
                autoSelected: 'zoom'
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            },
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true
            },
            locales: [{
                name: 'ar',
                options: {
                    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
                    shortMonths: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون',
                        'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
                    days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
                    shortDays: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
                    toolbar: {
                        download: 'تحميل',
                        selection: 'تحديد',
                        selectionZoom: 'تكبير التحديد',
                        zoomIn: 'تكبير',
                        zoomOut: 'تصغير',
                        pan: 'تحريك',
                        reset: 'إعادة تعيين'
                    }
                }
            }],
            defaultLocale: 'ar'
        },
        title: {
            text: options.title || 'تاريخ الأسعار',
            align: 'right',
            style: {
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Cairo, sans-serif',
                color: '#1f2937'
            }
        },
        xaxis: {
            type: 'category',
            crosshairs: {
                show: true,
                position: 'back',
                stroke: {
                    color: '#60a5fa',
                    width: 1,
                    dashArray: 3
                }
            },
            labels: {
                style: {
                    fontFamily: 'Cairo, sans-serif'
                },
                rotate: -45,
                rotateAlways: false
            },
            axisBorder: {
                show: true,
                color: '#e5e7eb'
            },
            axisTicks: {
                show: true,
                color: '#e5e7eb'
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            crosshairs: {
                show: true,
                position: 'back',
                stroke: {
                    color: '#60a5fa',
                    width: 1,
                    dashArray: 3
                }
            },
            labels: {
                style: {
                    fontFamily: 'Cairo, sans-serif'
                },
                formatter: (value) => value.toFixed(2)
            }
        },
        grid: {
            borderColor: '#e5e7eb',
            strokeDashArray: 4,
            padding: {
                left: 10,
                right: 10
            }
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#22c55e',  // Green for price increase
                    downward: '#ef4444' // Red for price decrease
                },
                wick: {
                    useFillColor: true
                }
            }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            style: {
                fontFamily: 'Cairo, sans-serif'
            },
            custom: function ({ seriesIndex, dataPointIndex, w }) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                const o = data.y[0]; // Open
                const h = data.y[1]; // High
                const l = data.y[2]; // Low
                const c = data.y[3]; // Close
                const date = data.x;
                const change = c - o;
                const changePercent = ((change / o) * 100).toFixed(2);
                const isUp = c >= o;

                return `
                    <div class="p-3 rounded-lg shadow-lg border" style="background:#0b1220;color:#e2e8f0;border-color:#1e293b;min-width:220px" dir="rtl">
                        <div class="text-sm font-semibold mb-2" style="color:#93c5fd">${date}</div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div style="color:#94a3b8">الافتتاح:</div>
                            <div class="font-medium">${o.toFixed(2)}</div>
                            <div style="color:#94a3b8">الأعلى:</div>
                            <div class="font-medium text-green-400">${h.toFixed(2)}</div>
                            <div style="color:#94a3b8">الأدنى:</div>
                            <div class="font-medium text-red-400">${l.toFixed(2)}</div>
                            <div style="color:#94a3b8">الإغلاق:</div>
                            <div class="font-medium">${c.toFixed(2)}</div>
                            <div style="color:#94a3b8">التغير:</div>
                            <div class="font-medium ${isUp ? 'text-green-600' : 'text-red-600'}">
                                ${isUp ? '+' : ''}${change.toFixed(2)} (${changePercent}%)
                            </div>
                        </div>
                    </div>
                `;
            }
        },
        annotations: options.annotations || {}
    };

    // Merge with custom options using deep merge for nested objects
    // Handle title as both string (just text) or object (full config)
    const titleConfig = typeof options.title === 'string'
        ? { text: options.title }
        : (options.title || {});

    const chartOptions = {
        ...defaultOptions,
        ...options,
        // Deep merge title to preserve style defaults
        title: {
            ...defaultOptions.title,
            ...titleConfig,
            style: {
                ...defaultOptions.title.style,
                ...(titleConfig.style || {})
            }
        },
        // Deep merge chart options
        chart: {
            ...defaultOptions.chart,
            ...(options.chart || {})
        }
    };

    const chart = new ApexCharts(container, chartOptions);
    chart.render();

    return chart;
}

/**
 * Create a line chart for price history
 * @param {string} containerId - The ID of the container element
 * @param {Array} historyData - Array of historical price data
 * @param {Object} options - Additional chart options
 * @returns {Object} ApexCharts instance
 */
export function createLineChart(containerId, historyData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return null;
    }

    // Clear any existing chart
    container.innerHTML = '';

    // Transform data for line chart
    const closePrices = historyData.map(item => ({
        x: item.date || item.datetime,
        y: item.close
    }));

    const volumes = historyData.map(item => ({
        x: item.date || item.datetime,
        y: item.volume || 0
    }));

    const defaultOptions = {
        series: [
            {
                name: 'سعر الإغلاق',
                type: 'line',
                data: closePrices
            },
            {
                name: 'حجم التداول',
                type: 'bar',
                data: volumes
            }
        ],
        chart: {
            height: 350,
            type: 'line',
            fontFamily: 'Cairo, sans-serif',
            background: 'transparent',
            toolbar: {
                show: true
            },
            dropShadow: {
                enabled: true,
                color: '#1a73e8',
                top: 3,
                left: 2,
                blur: 4,
                opacity: 0.2
            }
        },
        stroke: {
            width: [3, 0],
            curve: 'smooth'
        },
        title: {
            text: options.title || 'تطور السعر',
            align: 'right',
            style: {
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Cairo, sans-serif',
                color: '#1f2937'
            }
        },
        colors: ['#1a73e8', '#9ca3af'],
        fill: {
            opacity: [1, 0.3]
        },
        xaxis: {
            type: 'category',
            labels: {
                style: {
                    fontFamily: 'Cairo, sans-serif'
                },
                rotate: -45
            }
        },
        yaxis: [
            {
                title: {
                    text: 'السعر (جنيه)',
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    }
                },
                labels: {
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    },
                    formatter: (value) => value.toFixed(2)
                }
            },
            {
                opposite: true,
                title: {
                    text: 'الحجم',
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    }
                },
                labels: {
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    },
                    formatter: (value) => formatVolume(value)
                }
            }
        ],
        tooltip: {
            shared: true,
            intersect: false,
            style: {
                fontFamily: 'Cairo, sans-serif'
            }
        },
        legend: {
            fontFamily: 'Cairo, sans-serif',
            position: 'top',
            horizontalAlign: 'right'
        }
    };

    // Deep merge for nested objects - handle title as string or object
    const titleConfig = typeof options.title === 'string'
        ? { text: options.title }
        : (options.title || {});

    const chartOptions = {
        ...defaultOptions,
        ...options,
        title: {
            ...defaultOptions.title,
            ...titleConfig,
            style: {
                ...defaultOptions.title.style,
                ...(titleConfig.style || {})
            }
        },
        chart: {
            ...defaultOptions.chart,
            ...(options.chart || {})
        }
    };
    const chart = new ApexCharts(container, chartOptions);
    chart.render();

    return chart;
}

/**
 * Create an area chart for price history with gradient
 * @param {string} containerId - The ID of the container element
 * @param {Array} historyData - Array of historical price data
 * @param {Object} options - Additional chart options
 * @returns {Object} ApexCharts instance
 */
export function createAreaChart(containerId, historyData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return null;
    }

    container.innerHTML = '';

    const closePrices = historyData.map(item => ({
        x: item.date || item.datetime,
        y: item.close
    }));

    const defaultOptions = {
        series: [{
            name: 'السعر',
            data: closePrices
        }],
        chart: {
            type: 'area',
            height: 300,
            fontFamily: 'Cairo, sans-serif',
            background: 'transparent',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        colors: ['#1a73e8'],
        title: {
            text: options.title || '',
            align: 'right',
            style: {
                fontSize: '14px',
                fontFamily: 'Cairo, sans-serif'
            }
        },
        xaxis: {
            type: 'category',
            labels: {
                show: options.showLabels !== false,
                style: {
                    fontFamily: 'Cairo, sans-serif',
                    fontSize: '10px'
                },
                rotate: -45
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontFamily: 'Cairo, sans-serif'
                },
                formatter: (value) => value.toFixed(2)
            }
        },
        grid: {
            show: false
        },
        tooltip: {
            enabled: true,
            style: {
                fontFamily: 'Cairo, sans-serif'
            }
        },
        dataLabels: {
            enabled: false
        }
    };

    // Deep merge for nested objects - handle title as string or object
    const titleConfig = typeof options.title === 'string'
        ? { text: options.title }
        : (options.title || {});

    const chartOptions = {
        ...defaultOptions,
        ...options,
        title: {
            ...defaultOptions.title,
            ...titleConfig,
            style: {
                ...defaultOptions.title.style,
                ...(titleConfig.style || {})
            }
        },
        chart: {
            ...defaultOptions.chart,
            ...(options.chart || {})
        }
    };
    const chart = new ApexCharts(container, chartOptions);
    chart.render();

    return chart;
}

/**
 * Create a combined chart with candlestick and volume
 * @param {string} containerId - The ID of the container element
 * @param {Array} historyData - Array of historical price data
 * @param {Object} options - Additional chart options
 * @returns {Object} ApexCharts instance
 */
export function createCombinedChart(containerId, historyData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return null;
    }

    container.innerHTML = '';

    const candlestickData = historyData.map(item => ({
        x: item.date || item.datetime,
        y: [item.open, item.high, item.low, item.close]
    }));

    const volumeData = historyData.map(item => ({
        x: item.date || item.datetime,
        y: item.volume || 0,
        fillColor: item.close >= item.open ? '#22c55e' : '#ef4444'
    }));

    const defaultOptions = {
        series: [
            {
                name: 'السعر',
                type: 'candlestick',
                data: candlestickData
            },
            {
                name: 'الحجم',
                type: 'bar',
                data: volumeData
            }
        ],
        chart: {
            height: 400,
            fontFamily: 'Cairo, sans-serif',
            background: 'transparent',
            toolbar: {
                show: true
            }
        },
        title: {
            text: options.title || 'السعر والحجم',
            align: 'right',
            style: {
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Cairo, sans-serif',
                color: '#1f2937'
            }
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#22c55e',
                    downward: '#ef4444'
                }
            },
            bar: {
                columnWidth: '60%',
                colors: {
                    ranges: [{
                        from: 0,
                        to: Infinity,
                        color: '#22c55e'
                    }, {
                        from: -Infinity,
                        to: 0,
                        color: '#ef4444'
                    }]
                }
            }
        },
        xaxis: {
            type: 'category',
            labels: {
                style: {
                    fontFamily: 'Cairo, sans-serif'
                },
                rotate: -45
            }
        },
        yaxis: [
            {
                title: {
                    text: 'السعر (جنيه)',
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    }
                },
                labels: {
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    }
                }
            },
            {
                opposite: true,
                title: {
                    text: 'الحجم',
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    }
                },
                labels: {
                    style: {
                        fontFamily: 'Cairo, sans-serif'
                    },
                    formatter: (value) => formatVolume(value)
                }
            }
        ],
        tooltip: {
            shared: true,
            style: {
                fontFamily: 'Cairo, sans-serif'
            }
        },
        legend: {
            fontFamily: 'Cairo, sans-serif',
            position: 'top',
            horizontalAlign: 'right'
        }
    };

    // Deep merge for nested objects
    // Deep merge for nested objects - handle title as string or object
    const titleConfig = typeof options.title === 'string'
        ? { text: options.title }
        : (options.title || {});

    const chartOptions = {
        ...defaultOptions,
        ...options,
        title: {
            ...defaultOptions.title,
            ...titleConfig,
            style: {
                ...defaultOptions.title.style,
                ...(titleConfig.style || {})
            }
        },
        chart: {
            ...defaultOptions.chart,
            ...(options.chart || {})
        }
    };
    const chart = new ApexCharts(container, chartOptions);
    chart.render();

    return chart;
}

/**
 * Format volume number for display
 * @param {number} value - Volume value
 * @returns {string} Formatted string
 */
function formatVolume(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
}

/**
 * Update an existing chart with new data
 * @param {Object} chart - ApexCharts instance
 * @param {Array} newData - New data array
 */
export function updateChartData(chart, newData) {
    if (!chart || !chart.updateSeries) {
        console.error('Invalid chart instance');
        return;
    }

    chart.updateSeries([{
        data: newData
    }]);
}

/**
 * Destroy a chart instance
 * @param {Object} chart - ApexCharts instance
 */
export function destroyChart(chart) {
    if (chart && chart.destroy) {
        chart.destroy();
    }
}

// Export all functions
export default {
    createCandlestickChart,
    createLineChart,
    createAreaChart,
    createCombinedChart,
    updateChartData,
    destroyChart
};
