# 🧾 AI-Powered RFP Management System

A single-user, AI-powered RFP (Request for Proposal) management system that helps a procurement manager:

- Create RFPs using **natural language**
- Convert them into **structured RFPs**
- Manage vendors and **send RFPs via email**
- **Parse vendor responses** using Google Gemini
- Compare proposals and see an **AI recommendation**

Built with **Vite + React**, **Node.js + Express**, **MongoDB**, **Google Gemini**, and **Nodemailer**.  
Frontend lives in `/frontend`. All API calls use native `fetch`.

---

# 1. 🚀 Project Setup

## 1.a. Prerequisites

You’ll need:

- **Node.js**: v18+  
- **npm**  
- **MongoDB** (local or Atlas)  
- **Google Gemini API Key**  
- **SMTP Email Credentials**  

---

## 1.b. Install Steps (Frontend & Backend)

### ▶ Backend Setup

```bash
cd backend
npm install

Create a backend/.env file:
i have already created it just and values for each key

Start Backend:
npm run dev
```
### ▶ Frontend Setup
```bash
 cd frontend
npm install
npm run dev
```

# 2. 🛠 Tech Stack

## 2.a. Frontend
- **Vite + React**
- **React Router**
- **Native fetch**
- **Vite + React**
- **Tailwind CSS**

## 2.b. Backend 
- **Node.js + Express**
- **Mongoose (MonogoDB)**
- **Nodemailer**
- **Google Gemini**
- **dotenv,cors**

## 2.c. Database Models
- **vendor**
- **Rfp**
- **Proposal**

# 3. API Documentation :
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
          required: true
          schema:
            type: string
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
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Deleted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'
        '404':
          $ref: '#/components/responses/NotFound'

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

  /vendor/{id}:
    delete:
      summary: Delete vendor
      tags: [Vendor]
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Vendor deleted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'

  /rfp/{id}/invite-vendors:
    post:
      summary: Invite vendors for an RFP (send email)
      tags: [Email, RFP]
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
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
      responses:
        '200':
          description: Vendors invited successfully

  /rfp/{rfpId}/vendor/{vendorId}/proposal:
    post:
      summary: Parse vendor email → create proposal (AI)
      tags: [Proposal, Email]
      parameters:
        - in: path
          name: rfpId
          required: true
          schema:
            type: string
        - in: path
          name: vendorId
          required: true
          schema:
            type: string
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
      responses:
        '201':
          description: Proposal created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Proposal'

components:
  schemas:
    RfpSummary:
      type: object
      properties:
        _id: { type: string }
        title: { type: string }
        budget: { type: number }
        deliveryDays: { type: number }
        paymentTerms: { type: string }
        warranty: { type: string }

    LineItem:
      type: object
      properties:
        name: { type: string }
        quantity: { type: number }
        spec: { type: string }

    RfpCreate:
      type: object
      properties:
        title: { type: string }
        descriptionNlp: { type: string }
        budget: { type: number }
        deliveryDays: { type: number }
        paymentTerms: { type: string }
        warranty: { type: string }
        lineItems:
          type: array
          items:
            $ref: '#/components/schemas/LineItem'

    Rfp:
      allOf:
        - $ref: '#/components/schemas/RfpCreate'

    VendorCreate:
      type: object
      properties:
        name: { type: string }
        email: { type: string }
        phone: { type: string }

    Vendor:
      allOf:
        - $ref: '#/components/schemas/VendorCreate'

    Proposal:
      type: object
      properties:
        _id: { type: string }
        rfp: { type: string }
        vendor: { type: string }
        totalPrice: { type: number }
        deliveryDays: { type: number }
        paymentTerms: { type: string }
        warranty: { type: string }
        aiSummary: { type: string }
        scoreOverall: { type: number }

    SuccessMessage:
      type: object
      properties:
        message: { type: string }

  responses:
    BadRequest:
      description: Bad Request
    NotFound:
      description: Not Found
    ServerError:
      description: Server Error


