const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Customer {
    id: ID!
    name: String!
    email: String!
    address: String!
    phone: String
    orders: [Order!]!
  }

  type Order {
    id: ID!
    customer: Customer!
    orderDate: String!
    status: String!
    items: [OrderItem!]!
    payment: OrderPayment
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productName: String!
    quantity: Int!
    price: Float!
  }

  type Query {
    customers: [Customer!]!
    customer(id: ID!): Customer
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createCustomer(
      name: String!
      email: String!
      address: String!
      phone: String
    ): Customer!

    createOrder(
      customerId: ID!
      items: [OrderItemInput!]!
    ): Order!

    updateOrderStatus(
      id: ID!
      status: String!
    ): Order!

    updatePaymentStatus(
      orderId: ID!
      status: PaymentStatus!
      paymentMethod: String
      transactionId: String
    ): OrderPayment!

    updateOrderItem(
      id: ID!
      quantity: Int
      price: Float
    ): OrderItem!
  }

  input OrderItemInput {
    productName: String!
    quantity: Int!
    price: Float!
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
    CANCELLED
  }

  type OrderPayment {
    id: ID!
    status: PaymentStatus!
    amount: Float!
    paymentDate: String
    paymentMethod: String
    transactionId: String
    createdAt: String!
    updatedAt: String!
  }
`;

module.exports = { typeDefs }; 