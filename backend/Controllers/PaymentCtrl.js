const Payments = require("../Model/PaymentModel");
const Users = require("../Model/userModel");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const STORAGE = require("../utils/Storage");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_KEY);
const paymentCtrl = {
  //Get All Payment
  getPayments: async (req, res) => {
    try {
      const payments = await Payments.find({ deleteAt: false }).populate(
        "user_id"
      );
      res.json(payments);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  // Payment Stripe
  StripePayments: async (req, res) => {
    try {
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "KE"],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: 0,
                currency: "usd",
              },
              display_name: "Free shipping",
              // Delivers between 5-7 business days
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: 5,
                },
                maximum: {
                  unit: "business_day",
                  value: 7,
                },
              },
            },
          },
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: 1500,
                currency: "usd",
              },
              display_name: "Next day air",
              // Delivers in exactly 1 business day
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: 1,
                },
                maximum: {
                  unit: "business_day",
                  value: 1,
                },
              },
            },
          },
        ],
        phone_number_collection: {
          enabled: true,
        },
        customer_email: req.body.email,
        line_items: req.body.cartItems.map((item) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
                images: [item.image.url],
                description: item.description,
              },
              unit_amount: item.price * 100,
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity,
          };
        }),

        success_url: `${req.protocol}://${req.get("host")}/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/cart`,
      };

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);

      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  },
  //Get Stripe
  getPaymentDeletes: async (req, res) => {
    try {
      const payments = await Payments.find({ deleteAt: true }).populate(
        "user_id"
      );
      res.json({
        status: 200,
        success: true,
        msg: "Get All User Delete Payment",
        payments,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  //Password Check then delete
  CheckPassDelete: async (req, res) => {
    try {
      const userId = req.user.id;
      const { checkPassword } = req.body;
      const user = await Users.findById(userId).select("password");
      const isMatch = await bcrypt.compare(checkPassword, user.password);
      if (isMatch) {
        return res.json({
          status: 200,
          success: true,
          msg: "Check Password Successfully",
        });
      } else {
        return res.json({
          status: 400,
          success: false,
          msg: "Incorrect password",
        });
      }
    } catch (error) {
      return res.json({
        status: 400,
        success: false,
        msg: error.message,
      });
    }
  },
  //Delete Soft Erase
  DeletePaymentSoftErase: async (req, res) => {
    try {
      await Payments.findOneAndUpdate(
        { _id: req.params.id },
        {
          deleteAt: true,
        }
      );
      res.status(200).json({
        status: 200,
        success: true,
        msg: "Delete Payment Successfully",
      });
    } catch (error) {
      return res.status(500).json({ msg: err.message });
    }
  },
  UndoPaymentSoftErase: async (req, res) => {
    try {
      await Payments.findByIdAndUpdate(
        { _id: req.params.id },
        {
          deleteAt: false,
        }
      );
      res.status(200).json({
        status: 200,
        success: true,
        msg: "Undo Payment Successfully",
      });
    } catch (error) {
      return res.status(500).json({ msg: err.message });
    }
  },
  //Get Id Payment
  getIdPayment: async (req, res) => {
    const Payment = await Payments.findById(req.params.id);
    try {
      if (!Payment) {
        return res.status(404).json({
          status: 400,
          success: false,
          msg: "Payments not found !!!",
        });
      }
      res.status(200).json({
        status: 200,
        success: true,
        msg: "Get Payments Detail Successfully !",
        Payment,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Create Payment Paypal
  createPayment: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select(
        "name email total_cart discount voucher"
      );
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      const { cart, paymentID, address } = req.body;
      const cost = cart.reduce((prev, item) => {
        return prev + item.price * item.quantity;
      }, 0);
      const { _id, name, email } = user;

      const newPayment = new Payments({
        user_id: _id,
        name,
        email,
        cart,
        cost,
        voucher: user.voucher,
        discount: user.discount,
        total: user.total_cart,
        paymentID,
        address,
        status: true,
      });
      console.log(newPayment);
      cart.filter((item) => {
        return STORAGE.sold(item._id, item.quantity, item.sold);
      });
      cart.filter((item) => {
        return STORAGE.stock(item._id, item.quantity, item.countInStock);
      });

      await newPayment.save();
      await Users.findByIdAndUpdate(
        { _id: req.user.id },
        { total_cart: 0, discount: 0, voucher: 0 }
      );
      res.json({ msg: "Payment Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  //Update order status
  async updateOrderStatus(req, res) {
    try {
      const id = req.params.id;
      const { order_status } = req.body;

      if (order_status !== "On Delivery" && order_status !== "Delivered") {
        return res.json({
          status: 400,
          success: false,
          msg: "Please choose order status",
        });
      }
      await Payments.findByIdAndUpdate(
        { _id: id },
        { order_status, updatedAt: Date.now }
      );
      return res.status(200).json({
        status: 200,
        success: true,
        msg: "Update order status successfully",
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        success: false,
        msg: "Failed to update order status",
      });
    }
  },

  //New User Buy 3 Day
  UserNewBuyPayment: async (req, res) => {
    const GetDayNewUserBuy = (d1, d2) => {
      let value1 = d1.getTime();
      let value2 = d2.getTime();
      return Math.ceil((value2 - value1) / (24 * 60 * 60 * 1000));
    };
    let payments = await Payments.find({ deleteAt: false }).populate("user_id");
    var today = new Date();
    var result = [];
    for (var i = 0; i < payments.length; i++) {
      var time = GetDayNewUserBuy(payments[i].createdAt, today);
      if (time <= 3) {
        result.push(payments[i]);
      }
    }
    if (result.length === 0) {
      res.json({
        status: 200,
        success: true,
        msg: "No Account New  !!",
        result,
      });
    } else {
      res.json({
        status: 200,
        success: true,
        total: result.length,
        msg: "Get New User Buy Successfully !!",
        result,
      });
    }
  },

  //Get sum of income
  async getSumOfIncome(req, res) {
    try {
      const data = await Payments.aggregate([
        {
          $group: {
            _id: "sum_of_income",
            total: { $sum: "$total" },
          },
        },
      ]);

      return res.status(200).json({
        status: 200,
        success: true,
        msg: "Get sum of income successfully",
        data,
      });
    } catch (error) {
      res.status(400).json({
        status: 400,
        success: false,
        msg: "Get sum of income fail",
      });
    }
  },

  //Get monthly the income customer have received
  async getMonthlyIncomeCustomerReceived(req, res) {
    const monthly = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const year_now = new Date().getFullYear();

    try {
      let data = await Payments.aggregate([
        {
          //giong select
          $project: {
            month: { $month: "$updatedAt" },
            year: { $year: "$updatedAt" },
            order_status: 1, //số 1 là lấy số 0 là không lấy
            total: 1,
          },
        },
        {
          //kiểm tra
          $match: {
            month: { $in: monthly },
            year: year_now,
            order_status: "Delivered",
          },
        },
        {
          //khai báo nhận giá trị tự đặt
          $group: {
            _id: {
              month: "$month",
            },
            total_income: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      res.status(200).json({
        status: 200,
        success: true,
        msg: "Get monthly income successfully",
        data,
      });
    } catch (err) {
      res.status(400).json({
        status: 400,
        success: false,
        msg: "Failed to get monthly income",
      });
    }
  },

  //Get the income customer received this month and compare to last month
  async getIncomeCustomerReceivedThisAndLastMonth(req, res) {
    const thisMonth = new Date().getMonth() + 1;
    const lastMonth = new Date().getMonth();

    try {
      let data = await Payments.aggregate([
        {
          $project: {
            month: { $month: "$updatedAt" },
            order_status: 1,
            total: 1,
          },
        },
        {
          $match: {
            month: { $in: [lastMonth, thisMonth] },
            order_status: "Delivered",
          },
        },
        {
          $group: {
            _id: {
              month: "$month",
            },
            total_income: { $sum: "$total" },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      if (data.length === 0) {
        return res.status(400).json({
          status: 400,
          success: false,
          msg: "Not data to show",
        });
      } else if (data.length === 1) {
        if (data[0]._id.month === thisMonth) {
          data = [
            {
              _id: {
                month: "This month",
              },
              total_income: data[0].total_income,
            },
            {
              _id: {
                month: "Last month",
              },
              total_income: 0,
            },
            {
              compared: "Increased",
              value: data[0].total_income * 100,
            },
          ];

          return res.status(200).json({
            status: 200,
            success: true,
            msg: "Get income of orders customer have received this and last month successfully",
            data,
          });
        } else if (data[0]._id.month === lastMonth) {
          data = [
            {
              _id: {
                month: "This month",
              },
              total_income: 0,
            },
            {
              _id: {
                month: "Last month",
              },
              total_income: data[0].total_income,
            },
            {
              compared: "Decreased",
              value: -100,
            },
          ];
          return res.status(200).json({
            status: 200,
            success: true,
            msg: "Get income of orders customer have received this and last month successfully",
            data,
          });
        }
      } else if (data.length === 2) {
        (data[0]._id.month = "This month"), (data[1]._id.month = "Last month");

        const value = (
          ((data[0].total_income - data[1].total_income) /
            data[1].total_income) *
          100
        ).toFixed(1);

        const compared = value >= 0 ? "Increased" : "Decreased";

        const compareToLastMonth = {
          compared,
          value,
        };

        data.push(compareToLastMonth);

        return res.status(200).json({
          status: 200,
          success: true,
          msg: "Get income of orders customer have received this and last month successfully",
          data,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: 400,
        success: false,
        msg: "Get income of orders customer have received this and last month fail",
        error: error.message,
      });
    }
  },

  //Get the income customer not received this month and compare to last month
  async getIncomeCustomerNotReceivedThisAndLastMonth(req, res) {
    const thisMonth = new Date().getMonth() + 1;
    const lastMonth = new Date().getMonth();

    try {
      let data = await Payments.aggregate([
        {
          $project: {
            month: { $month: "$updatedAt" },
            order_status: 1,
            total: 1,
          },
        },
        {
          $match: {
            month: { $in: [lastMonth, thisMonth] },
            order_status: { $in: ["Ordered", "On Delivery"] },
          },
        },
        {
          $group: {
            _id: {
              month: "$month",
            },
            total_income: { $sum: "$total" },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      if (data.length === 0) {
        return res.status(400).json({
          status: 400,
          success: false,
          msg: "Not data to show",
        });
      } else if (data.length === 1) {
        if (data[0]._id.month === thisMonth) {
          data = [
            {
              _id: {
                month: "This month",
              },
              total_income: data[0].total_income,
            },
            {
              _id: {
                month: "Last month",
              },
              total_income: 0,
            },
            {
              compared: "Increased",
              value: data[0].total_income * 100,
            },
          ];

          return res.status(200).json({
            status: 200,
            success: true,
            msg: "Get income of orders customer have not received this and last month successfully",
            data,
          });
        } else if (data[0]._id.month === lastMonth) {
          data = [
            {
              _id: {
                month: "This month",
              },
              total_income: 0,
            },
            {
              _id: {
                month: "Last month",
              },
              total_income: data[0].total_income,
            },
            {
              compared: "Decreased",
              value: -100,
            },
          ];
          return res.status(200).json({
            status: 200,
            success: true,
            msg: "Get income of orders customer have not received this and last month successfully",
            data,
          });
        }
      } else if (data.length === 2) {
        (data[0]._id.month = "This month"), (data[1]._id.month = "Last month");

        const value = (
          ((data[0].total_income - data[1].total_income) /
            data[1].total_income) *
          100
        ).toFixed(1);

        const compared = value >= 0 ? "Increased" : "Decreased";

        const compareToLastMonth = {
          compared,
          value,
        };

        data.push(compareToLastMonth);

        return res.status(200).json({
          status: 200,
          success: true,
          msg: "Get income of orders customer have not received this and last month successfully",
          data,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: 400,
        success: false,
        msg: "Get income of orders customer have not received this and last month fail",
        error: error.message,
      });
    }
  },
};

module.exports = paymentCtrl;