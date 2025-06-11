import React, { useState, useEffect } from 'react';
import { Milk } from '../types';
import { getMilkList } from '../services/milkService';
import { authService, userService } from '../services/api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Card, Typography, Box, IconButton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../context/AuthContext';
import MuiTooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardStats {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    averageRate: number;
    milkTypeBreakdown: {
        [key: string]: {
            quantity: number;
            amount: number;
        };
    };
    recentEntries: Milk[];
    dailyStats: {
        date: string;
        quantity: number;
        amount: number;
        averageRate: number;
    }[];
    weeklyComparison: {
        thisWeek: {
            quantity: number;
            amount: number;
        };
        lastWeek: {
            quantity: number;
            amount: number;
        };
    };
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalEntries: 0,
        totalQuantity: 0,
        totalAmount: 0,
        averageRate: 0,
        milkTypeBreakdown: {},
        recentEntries: [],
        dailyStats: [],
        weeklyComparison: {
            thisWeek: { quantity: 0, amount: 0 },
            lastWeek: { quantity: 0, amount: 0 }
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const { user, token, logout } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, [token, timeRange]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch total users count if admin
                if (user?.roles?.some(role => role.name === 'ROLE_ADMIN') && token) {
                    const usersCount = await userService.getTotalUsers(token);
                    setTotalUsers(usersCount);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [user, token]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await authService.logout();
            logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    const calculateDailyStats = (milkList: Milk[]) => {
        const dailyData: { [key: string]: { quantity: number; amount: number; entries: number } } = {};
        const today = new Date();
        const daysToShow = timeRange === '30days' ? 30 : 7;

        // Initialize all days with zero values
        for (let i = 0; i < daysToShow; i++) {
            const date = format(subDays(today, i), 'yyyy-MM-dd');
            dailyData[date] = { quantity: 0, amount: 0, entries: 0 };
        }

        // Calculate stats for each day
        milkList.forEach(milk => {
            const date = format(new Date(milk.entryDate), 'yyyy-MM-dd');
            if (dailyData[date]) {
                dailyData[date].quantity += milk.quantity;
                dailyData[date].amount += milk.amount;
                dailyData[date].entries += 1;
            }
        });

        // Convert to array and calculate average rate
        return Object.entries(dailyData).map(([date, data]) => ({
            date,
            quantity: data.quantity,
            amount: data.amount,
            averageRate: data.entries > 0 ? data.amount / data.quantity : 0
        })).reverse();
    };

    const calculateWeeklyComparison = (milkList: Milk[]) => {
        const today = new Date();
        const thisWeekStart = startOfDay(subDays(today, 7));
        const lastWeekStart = startOfDay(subDays(today, 14));

        const thisWeekData = milkList.filter(milk =>
            isWithinInterval(new Date(milk.entryDate), {
                start: thisWeekStart,
                end: endOfDay(today)
            })
        );

        const lastWeekData = milkList.filter(milk =>
            isWithinInterval(new Date(milk.entryDate), {
                start: lastWeekStart,
                end: subDays(thisWeekStart, 1)
            })
        );

        return {
            thisWeek: {
                quantity: thisWeekData.reduce((sum, milk) => sum + milk.quantity, 0),
                amount: thisWeekData.reduce((sum, milk) => sum + milk.amount, 0)
            },
            lastWeek: {
                quantity: lastWeekData.reduce((sum, milk) => sum + milk.quantity, 0),
                amount: lastWeekData.reduce((sum, milk) => sum + milk.amount, 0)
            }
        };
    };

    const fetchDashboardData = async () => {
        if (!token) {
            setError('Authentication token is missing');
            setLoading(false);
            return;
        }

        try {
            const isAdmin = user?.roles?.some(role => role.name === 'ROLE_ADMIN') || false;
            const milkList = await getMilkList(token, isAdmin);

            // Calculate dashboard statistics
            const totalEntries = milkList.length;
            const totalQuantity = milkList.reduce((sum, milk) => sum + milk.quantity, 0);
            const totalAmount = milkList.reduce((sum, milk) => sum + milk.amount, 0);
            const averageRate = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

            // Calculate milk type breakdown
            const milkTypeBreakdown = milkList.reduce((acc, milk) => {
                if (!acc[milk.milkType]) {
                    acc[milk.milkType] = { quantity: 0, amount: 0 };
                }
                acc[milk.milkType].quantity += milk.quantity;
                acc[milk.milkType].amount += milk.amount;
                return acc;
            }, {} as { [key: string]: { quantity: number; amount: number } });

            // Get recent entries
            const recentEntries = [...milkList]
                .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                .slice(0, 5);

            // Calculate daily stats and weekly comparison
            const dailyStats = calculateDailyStats(milkList);
            const weeklyComparison = calculateWeeklyComparison(milkList);

            setStats({
                totalEntries,
                totalQuantity,
                totalAmount,
                averageRate,
                milkTypeBreakdown,
                recentEntries,
                dailyStats,
                weeklyComparison
            });
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to fetch dashboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const renderTrendChart = () => {
        const data = {
            labels: stats.dailyStats.map(stat => format(new Date(stat.date), 'MMM dd')),
            datasets: [
                {
                    label: 'Quantity (L)',
                    data: stats.dailyStats.map(stat => stat.quantity),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    yAxisID: 'y',
                },
                {
                    label: 'Amount (₹)',
                    data: stats.dailyStats.map(stat => stat.amount),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    yAxisID: 'y1',
                },
            ],
        };

        const options = {
            responsive: true,
            interaction: {
                mode: 'index' as const,
                intersect: false,
            },
            stacked: false,
            scales: {
                y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: {
                        display: true,
                        text: 'Quantity (L)',
                    },
                },
                y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: {
                        display: true,
                        text: 'Amount (₹)',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        };

        return <Line data={data} options={options} />;
    };

    const renderMilkTypeChart = () => {
        const data = {
            labels: Object.keys(stats.milkTypeBreakdown),
            datasets: [
                {
                    data: Object.values(stats.milkTypeBreakdown).map(data => data.quantity),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom' as const,
                },
                title: {
                    display: true,
                    text: 'Milk Type Distribution',
                },
            },
        };

        return <Doughnut data={data} options={options} />;
    };

    const renderWeeklyComparisonChart = () => {
        const data = {
            labels: ['Last Week', 'This Week'],
            datasets: [
                {
                    label: 'Quantity (L)',
                    data: [stats.weeklyComparison.lastWeek.quantity, stats.weeklyComparison.thisWeek.quantity],
                    backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                    borderColor: ['rgb(153, 102, 255)', 'rgb(75, 192, 192)'],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantity (L)',
                    },
                },
            },
        };

        return <Bar data={data} options={options} />;
    };

    const handleEditEntry = (id: number) => {
        // TODO: Implement edit functionality, possibly by opening AddMilkForm in edit mode
        console.log('Edit entry:', id);
    };

    const handleDeleteEntry = (id: number) => {
        // TODO: Implement delete functionality, possibly by opening a confirmation modal
        console.log('Delete entry:', id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="ml-2">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-blue-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as '7days' | '30days' | 'all')}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:border-blue-400 transition-colors duration-200"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className={`px-6 py-2 rounded-lg text-white font-medium shadow-sm transition-all duration-200 ${loggingOut
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 hover:shadow-md active:transform active:scale-95'
                            }`}
                    >
                        {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                        Total Entries
                    </Typography>
                    <Typography variant="h4" className="text-gray-800 font-bold">
                        {stats.totalEntries}
                    </Typography>
                </Card>
                <Card className="p-6 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                        Total Quantity
                    </Typography>
                    <Typography variant="h4" className="text-gray-800 font-bold">
                        {stats.totalQuantity.toFixed(2)} L
                    </Typography>
                </Card>
                <Card className="p-6 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                        Total Amount
                    </Typography>
                    <Typography variant="h4" className="text-gray-800 font-bold">
                        ₹{stats.totalAmount.toFixed(2)}
                    </Typography>
                </Card>
                <Card className="p-6 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                        Average Rate
                    </Typography>
                    <Typography variant="h4" className="text-gray-800 font-bold">
                        ₹{stats.averageRate.toFixed(2)}/L
                    </Typography>
                </Card>
            </div>

            {user?.roles?.some(role => role.name === 'ROLE_ADMIN') && (
                <div className="mb-8">
                    <Card className="p-6 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                        <div className="flex items-center">
                            <PeopleIcon className="text-blue-500 mr-3 text-3xl" />
                            <Typography variant="h6" color="textSecondary" className="text-blue-700">
                                Total Users
                            </Typography>
                        </div>
                        <Typography variant="h4" className="mt-3 text-gray-800 font-bold">
                            {totalUsers}
                        </Typography>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 transform transition-all duration-200 hover:shadow-lg">
                    <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                        Daily Trend
                    </Typography>
                    <div className="h-80 bg-white rounded-lg p-4">{renderTrendChart()}</div>
                </Card>
                <Card className="p-6 transform transition-all duration-200 hover:shadow-lg">
                    <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                        Milk Type Distribution
                    </Typography>
                    <div className="h-80 bg-white rounded-lg p-4">{renderMilkTypeChart()}</div>
                </Card>
            </div>

            <Card className="p-6 mb-8 transform transition-all duration-200 hover:shadow-lg">
                <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                    Weekly Comparison
                </Typography>
                <div className="h-80 bg-white rounded-lg p-4">{renderWeeklyComparisonChart()}</div>
            </Card>

            <Card className="p-6 transform transition-all duration-200 hover:shadow-lg">
                <Typography variant="h6" color="textSecondary" gutterBottom className="text-blue-700">
                    Recent Entries
                </Typography>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                    Rate
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.recentEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {format(new Date(entry.entryDate), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {entry.milkType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {entry.quantity.toFixed(2)} L
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        ₹{entry.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        ₹{(entry.amount / entry.quantity).toFixed(2)}/L
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard; 