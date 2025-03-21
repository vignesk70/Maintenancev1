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

  type Company {
    id: ID!
    name: String!
    address: String!
    phone: String
    email: String!
  }

  type Worker {
    id: ID!
    name: String!
    email: String!
    role: WorkerRole!
    phone: String
    active: Boolean!
    assignedOrders: [Order!]!
  }

  type Order {
    id: ID!
    customer: Customer!
    assignedWorker: Worker
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
    currentWorker: Worker
    company: Company
    workers: [Worker!]!
    worker(id: ID!): Worker
    myAssignedOrders: [Order!]!
    customers: [Customer!]!
    customer(id: ID!): Customer
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    updateCompany(
      name: String!
      address: String!
      phone: String
      email: String!
    ): Company!

    createWorker(
      name: String!
      email: String!
      password: String!
      role: WorkerRole!
      phone: String
    ): Worker!

    updateWorker(
      id: ID!
      name: String
      email: String
      role: WorkerRole
      phone: String
      active: Boolean
    ): Worker!

    assignOrder(
      orderId: ID!
      workerId: ID!
    ): Order!

    loginWorker(
      email: String!
      password: String!
    ): AuthPayload!

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

    updateWorkerPassword(
      id: ID!
      newPassword: String!
    ): Worker!

    updateOrderWorker(orderId: ID!, workerId: ID): Order!
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

  enum WorkerRole {
    STAFF
    ADMIN
  }

  type AuthPayload {
    token: String!
    worker: Worker!
  }
`;

module.exports = { typeDefs }; 