import express from "express";

import { myDB } from "../db/MyDB.js";
import { ObjectId } from "mongodb";

// Named export
export const router = express.Router();

router.get("/api/getTransactions", async (req, res) => {
  const year = req.query.Year;
  const month = req.query.Month;
  const query = { "Year" : year, "Month": month};
  const transactions = await myDB.getTransactions(query);
  res.json(transactions);
});

router.get("/api/getTransactionById", async (req, res) => {
  const query = { _id: new ObjectId(req.query.Id)};
  const transaction = await myDB.getTransactions(query);
  res.json(transaction);
});


router.get("/api/deleteTransaction", async (req, res) => {
  const query = { _id: new ObjectId(req.query.Id) };
  await myDB.deleteTransaction(query);
  res.json("route: Deleted successfully");
});

router.post("/api/addTransaction", async (req, res) => {
  const transaction = req.body;
  await myDB.addTransaction(transaction);
  res.json("Added Successfully");
});

// update
router.post("/api/updateTransaction", async (req, res) => {
  const transaction = req.body;
  await myDB.updateTransaction(transaction);
  res.json("Update: Successfully");
});

// set budget
router.post("/api/setBudget", async (req, res) => {
  const budget = req.body;
  await myDB.setBudget(budget);
  res.json("Budget setted");
});

// query all budgets 
router.get("/api/getBudgets", async (req, res) => {
  const budgets = await myDB.getBudgets({});
  res.json(budgets);
});

// delete budget
router.get("/api/deleteBudget", async (req, res) => {
  const query = { _id: new ObjectId(req.query.Id) };
  await myDB.deleteBudget(query);
  res.json("route: Deleted successfully");
});

// query budgets by year
router.get("/api/getBudgetsByYear", async(req, res) => {
  const query = { Year: req.query.year};
  const budgets = await myDB.getBudgets(query);
  res.json(budgets);
});

router.get("/", async (req, res) => {
  res.json("hello world");
});

// Default export
export default router;
