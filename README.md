# 🧾 AI-Powered RFP Management System

A single-user, AI-powered RFP (Request for Proposal) management system that helps a procurement manager:

- Create RFPs using **natural language**
- Convert them into **structured RFPs**
- Manage vendors and **send RFPs via email**
- **Parse vendor responses** using Google Gemini
- Compare proposals and see an **AI recommendation**

Built with **Vite + React**, **Node.js + Express**, **MongoDB**, **Google Gemini**, and **Nodemailer**.  
Frontend lives in `frontend/procurement`. All API calls use native `fetch`.

---

## 1. Project Setup

### 1.a. Prerequisites

You’ll need:

- **Node.js**: v18+ (recommended)
- **npm**: latest
- **MongoDB**: Local instance or MongoDB Atlas connection string
- **Google Gemini API key**
- **SMTP credentials** for sending emails (e.g. Gmail SMTP or other provider)

---

### 1.b. Install Steps (Frontend & Backend)

#### Backend

```bash
cd backend
npm install

Create a .env file in backend:
PORT=4000

MONGO_URI=mongodb://localhost:27017/rfp_system

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP for email sending
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM="Procurement <no-reply@yourdomain.com>"

Run backend:
npm run dev

By default: http://localhost:4000

cd frontend/procurement
npm install
npm run dev

1.c. How to Configure Email Sending/Receiving
Sending Emails

Email sending is done via Nodemailer in the backend.
Configure these in backend/.env:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Procurement <your@gmail.com>"

Receiving Vendor Responses

For this assignment, instead of a full inbound email integration, the app provides a:

Vendor Response Simulator screen
→ Select RFP + Vendor
→ Paste the vendor email text
→ Click Process response, which calls /api/rfps/:id/vendor-response and uses Gemini to parse it.

A real provider webhook (Mailgun/SendGrid → /api/email/inbound) can be added later but is out of scope for this demo.

1.d. How to Run Everything Locally

Start MongoDB (locally or ensure Atlas is reachable).

Start backend:

cd backend
npm run dev


Start frontend:

cd frontend/procurement
npm run dev


Open the frontend URL shown by Vite (typically http://localhost:5173).

From there you can:

Create RFPs from natural language

Add and manage vendors

Send RFPs to vendors (via email)

Paste vendor responses and process them

Compare proposals and view AI recommendations

2. Tech Stack
2.a. Frontend

Vite + React

React Router for navigation

Native fetch for HTTP requests

Tailwind CSS or basic CSS (depending on your styling choice)

2.b. Backend

Node.js + Express

Mongoose (MongoDB ODM)

Nodemailer for sending RFP emails

CORS, dotenv for configuration

2.c. Database

MongoDB (local or cloud via MongoDB Atlas)

Main collections / models:

Vendor – Vendor master data

Rfp – RFP metadata + structured fields + line items + invited vendors

Proposal – Vendor responses + parsed fields + AI scoring

All relationships use ObjectId references and Mongoose populate() for joins.

2.d. AI Provider

Google Gemini

Used for:

Converting natural language → structured RFP JSON.

Parsing vendor responses (free-text) into structured proposal data.

Computing simple scores and generating a recommendation with explanation.

2.e. Email Solution

Nodemailer configured with an SMTP provider (Gmail, Outlook, etc.)


openapi: 3.0.3
info:
  title: AI-Powered RFP Management System API
  version: 1.0.0

servers:
  - url: http://localhost:4000/api

paths:
  /rfp/list:
    get:
      summary: Get list of all RFPs
      tags: [RFP]
      responses:
        '200':
          description: List of RFPs
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/RfpSummary'
        '500':
          $ref: '#/components/responses/ServerError'

  /generate/rfp:
    post:
      summary: Generate structured RFP from natural language
      tags: [RFP]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                  description: Natural language RFP description
      responses:
        '200':
          description: Generated structured RFP
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GeneratedRfp'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/ServerError'

  /submit/rfp:
    post:
      summary: Save a structured RFP
      tags: [RFP]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RfpCreate'
      responses:
        '201':
          description: RFP created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Rfp'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/ServerError'

  /getrfp/{id}:
    get:
      summary: Get full details of a single RFP
      tags: [RFP]
      parameters:
        - in: path
          name: id
          schema:
            type: string
          required: true
          description: RFP Mongo ObjectId
      responses:
        '200':
          description: RFP details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Rfp'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/ServerError'

  /rfp/{id}:
    delete:
      summary: Delete an RFP
      tags: [RFP]
      parameters:
        - in: path
          name: id
          schema:
            type: string
          required: true
          description: RFP Mongo ObjectId
      responses:
        '200':
          description: RFP deleted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/ServerError'

  /create/vendor:
    post:
      summary: Create a new vendor
      tags: [Vendor]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VendorCreate'
      responses:
        '201':
          description: Vendor created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Vendor'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/ServerError'

  /list/vendor:
    get:
      summary: Get list of all vendors
      tags: [Vendor]
      responses:
        '200':
          description: List of vendors
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Vendor'
        '500':
          $ref: '#/components/responses/ServerError'

  /vendor/{id}:
    delete:
      summary: Delete a vendor
      tags: [Vendor]
      parameters:
        - in: path
          name: id
          schema:
            type: string
          required: true
          description: Vendor Mongo ObjectId
      responses:
        '200':
          description: Vendor deleted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/ServerError'

  /rfp/{id}/invite-vendors:
    post:
      summary: Invite vendors for a given RFP and send emails
      tags: [Email, RFP]
      parameters:
        - in: path
          name: id
          schema:
            type: string
          required: true
          description: RFP Mongo ObjectId
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [vendorIds]
              properties:
                vendorIds:
                  type: array
                  items:
                    type: string
                  description: Array of vendor IDs to invite
      responses:
        '200':
          description: Vendors invited successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  invitedVendors:
                    type: array
                    items:
                      $ref: '#/components/schemas/InvitedVendor'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/ServerError'

  /rfp/{rfpId}/vendor/{vendorId}/proposal:
    post:
      summary: Create proposal from vendor email body (AI parsed)
      tags: [Proposal, Email]
      parameters:
        - in: path
          name: rfpId
          schema:
            type: string
          required: true
          description: RFP Mongo ObjectId
        - in: path
          name: vendorId
          schema:
            type: string
          required: true
          description: Vendor Mongo ObjectId
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [emailBody]
              properties:
                emailBody:
                  type: string
                  description: Raw vendor email content
      responses:
        '201':
          description: Proposal created successfully from email
          content:
            application/json:
              schema:
                type: object
                properties:
                  proposal:
                    $ref: '#/components/schemas/Proposal'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/ServerError'

components:
  schemas:
    RfpSummary:
      type: object
      properties:
        _id:
          type: string
        title:
          type: string
        budget:
          type: number
        deliveryDays:
          type: integer
        paymentTerms:
          type: string
        warranty:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    RfpCreate:
      type: object
      required:
        - title
      properties:
        title:
          type: string
        descriptionNlp:
          type: string
        budget:
          type: number
        deliveryDays:
          type: integer
        paymentTerms:
          type: string
        warranty:
          type: string
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/LineItem'

    GeneratedRfp:
      allOf:
        - $ref: '#/components/schemas/RfpCreate'

    Rfp:
      allOf:
        - $ref: '#/components/schemas/RfpCreate'
        - type: object
          properties:
            _id:
              type: string
            invitedVendors:
              type: array
              items:
                $ref: '#/components/schemas/InvitedVendor'
            createdAt:
              type: string
              format: date-time
            updatedAt:
              type: string
              format: date-time

    LineItem:
      type: object
      properties:
        name:
          type: string
        quantity:
          type: integer
        spec:
          type: string

    InvitedVendor:
      type: object
      properties:
        vendor:
          type: string
          description: Vendor ID
        status:
          type: string
          example: SENT
        sentAt:
          type: string
          format: date-time

    VendorCreate:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string

    Vendor:
      allOf:
        - $ref: '#/components/schemas/VendorCreate'
        - type: object
          properties:
            _id:
              type: string
            createdAt:
              type: string
              format: date-time
            updatedAt:
              type: string
              format: date-time

    Proposal:
      type: object
      properties:
        _id:
          type: string
        rfp:
          type: string
          description: RFP ID
        vendor:
          type: string
          description: Vendor ID
        rawEmail:
          type: string
        totalPrice:
          type: number
        deliveryDays:
          type: integer
        paymentTerms:
          type: string
        warranty:
          type: string
        aiSummary:
          type: string
        scoreOverall:
          type: number
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    SuccessMessage:
      type: object
      properties:
        message:
          type: string

    Error:
      type: object
      properties:
        message:
          type: string

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'










