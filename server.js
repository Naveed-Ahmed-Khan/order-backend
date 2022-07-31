require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST_KEY);
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const subscriptionPlans = [
  { id: "1", name: "Starter", price: 50 },
  { id: "2", name: "Standard", price: 99 },
  { id: "3", name: "Premium", price: 199 },
];

const calculateOrderAmount = (items) => {
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  const selectedPlan = subscriptionPlans.filter(
    (plan) => plan.id === items[0].id
  );
  console.log(selectedPlan);
  return selectedPlan[0].price * items[0].quantity * 100;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  console.log(items);
  const orderAmount = calculateOrderAmount(items);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: orderAmount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/", (req, res) => res.send("Hello Server!"));
app.listen(port, () => console.log("Node server listening on port 5000!"));
