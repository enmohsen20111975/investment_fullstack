/**
 * User Income/Expense Model
 * User's income and expense tracking.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const UserIncomeExpense = sequelize.define('UserIncomeExpense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Transaction type and category
    transaction_type: {
        type: DataTypes.STRING(20),
        allowNull: false  // 'income', 'expense'
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false  // 'salary', 'dividend', 'trading_profit', 'investment', 'bills', 'food', etc.
    },
    // Amount
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'EGP'
    },
    // Details
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    related_asset_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    related_stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Dates
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // Recurring
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    recurrence_period: {
        type: DataTypes.STRING(20),
        allowNull: true  // 'daily', 'weekly', 'monthly', 'yearly'
    }
}, {
    tableName: 'user_income_expenses',
    timestamps: false,
    indexes: [
        {
            name: 'ix_income_expense_user',
            fields: ['user_id']
        },
        {
            name: 'ix_income_expense_date',
            fields: ['transaction_date']
        },
        {
            name: 'ix_income_expense_type',
            fields: ['transaction_type']
        }
    ]
});

module.exports = UserIncomeExpense;