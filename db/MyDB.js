import { MongoClient, ObjectId} from "mongodb";
import dotenv from "dotenv";

dotenv.config();

function MyDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const myDB = {};

  const connect = () => {
    const client = new MongoClient(uri);
    const db = client.db("project-2");

    return { client, db };
  };

  myDB.getTransactions = async (query) => {
    const { client, db } = connect();

    const transactionsCollection = db.collection("transactions");

    try {
      return await transactionsCollection.find(query).toArray();
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  myDB.deleteTransaction = async (query) => {
    const { client, db } = connect();

    const transactionsCollection = db.collection("transactions");
    try {
      const result = await transactionsCollection.deleteOne(query);
      if(result.deletedCount === 1) {
        console.log("Successfully deleted one document");
      } else {
        console.log("No documents matched the query");
      }
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  myDB.addTransaction = async (transaction) => {
    const { client, db } = connect();

    const transactionsCollection = db.collection("transactions");
    // console.log(transaction)
    try {
      return await transactionsCollection.insertOne(transaction);
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  myDB.updateTransaction = async (transaction) => {
    const { client, db } = connect();

    const transactionsCollection = db.collection("transactions");
    const filter = { _id: new ObjectId(transaction.Id)};

    const year = transaction.Date.split("-")[0];
    const month = transaction.Date.split("-")[1].charAt(0) === "0" ? transaction.Date.split("-")[1].charAt(1) : transaction.Date.split("-")[1];

    const updateDoc = {
      $set: {
        Category: transaction.Category,
        Amount: transaction.Amount,
        Date: transaction.Date,
        Notes: transaction.Notes,
        Year: year,
        Month: month
      }
    };

    try {
      const result = await transactionsCollection.updateOne(filter, updateDoc);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
    } finally {
      console.log("update: db closing connection");
      client.close();
    }
  };

  /* add and update budget*/
  myDB.setBudget = async (budget) => {
    const { client, db } = connect();

    const budgetsCollection = db.collection("budgets");

    const filter = { Month: budget.Month, Year: budget.Year}; 
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        "Budget": budget.Budget,
        "Total": budget.Total,
        "Remaining": budget.Remaining
      }
    };

    try {
      const result = await budgetsCollection.updateOne(filter, updateDoc, options);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
    } finally {
      console.log("update budget: db closing connection");
      client.close();
    }
  };

  myDB.getBudgets = async (query) => {
    const { client, db } = connect();

    const budgetsCollection = db.collection("budgets");

    try {
      return await budgetsCollection.find(query).toArray();
    } finally {
      console.log("db budgets collection closing connection");
      client.close();
    }
  };

  myDB.deleteBudget = async (query) => {
    const { client, db } = connect();
    
    const budgetsCollection = db.collection("budgets");
    try {
      const result = await budgetsCollection.deleteOne(query);
      if(result.deletedCount === 1) {
        console.log("Successfully deleted one document");
      } else {
        console.log("No documents matched the query");
      }
    } finally {
      console.log("db closing connection");
      client.close();
    }
  };

  return myDB;
}
export const myDB = MyDB();
