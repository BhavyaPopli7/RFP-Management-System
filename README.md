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
i have already created it just add values for each key

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
                  type: object
                  properties:
                    _id:
                      type: string
                    title:
                      type: string
                    budget:
                      type: number
                    deliveryDays:
                      type: number
                    paymentTerms:
                      type: string
                    warranty:
                      type: string
        '500':
          description: Server error

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
                type: object
                properties:
                  title:
                    type: string
                  budget:
                    type: number
                  deliveryDays:
                    type: number
                  paymentTerms:
                    type: string
                  warranty:
                    type: string
                  lineItems:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        quantity:
                          type: number
                        spec:
                          type: string
        '400':
          description: Bad request
        '500':
          description: Server error

  /submit/rfp:
    post:
      summary: Save a structured RFP
      tags: [RFP]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                descriptionNlp:
                  type: string
                budget:
                  type: number
                deliveryDays:
                  type: number
                paymentTerms:
                  type: string
                warranty:
                  type: string
                lineItems:
                  type: array
                  items:
                    type: object
                    properties:
                      name:
                        type: string
                      quantity:
                        type: number
                      spec:
                        type: string
      responses:
        '201':
          description: RFP created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  title:
                    type: string
                  descriptionNlp:
                    type: string
                  budget:
                    type: number
                  deliveryDays:
                    type: number
                  paymentTerms:
                    type: string
                  warranty:
                    type: string
                  lineItems:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        quantity:
                          type: number
                        spec:
                          type: string
        '400':
          description: Bad request
        '500':
          description: Server error

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
                type: object
                properties:
                  _id:
                    type: string
                  title:
                    type: string
                  descriptionNlp:
                    type: string
                  budget:
                    type: number
                  deliveryDays:
                    type: number
                  paymentTerms:
                    type: string
                  warranty:
                    type: string
                  lineItems:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        quantity:
                          type: number
                        spec:
                          type: string
                  invitedVendors:
                    type: array
                    items:
                      type: object
                      properties:
                        vendor:
                          type: string
                        status:
                          type: string
                        sentAt:
                          type: string
                          format: date-time
        '404':
          description: RFP not found
        '500':
          description: Server error

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
                type: object
                properties:
                  message:
                    type: string
        '404':
          description: RFP not found
        '500':
          description: Server error

  /create/vendor:
    post:
      summary: Create a new vendor
      tags: [Vendor]
      requestBody:
        required: true
        content:
          application/json:
            schema:
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
      responses:
        '201':
          description: Vendor created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  _id:
                    type: string
                  name:
                    type: string
                  email:
                    type: string
                  phone:
                    type: string
        '400':
          description: Bad request
        '500':
          description: Server error

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
                  type: object
                  properties:
                    _id:
                      type: string
                    name:
                      type: string
                    email:
                      type: string
                    phone:
                      type: string
        '500':
          description: Server error

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
                type: object
                properties:
                  message:
                    type: string
        '404':
          description: Vendor not found
        '500':
          description: Server error

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
                      type: object
                      properties:
                        vendor:
                          type: string
                        status:
                          type: string
                        sentAt:
                          type: string
                          format: date-time
        '400':
          description: Bad request
        '500':
          description: Server error

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
                type: object
                properties:
                  _id:
                    type: string
                  rfp:
                    type: string
                  vendor:
                    type: string
                  totalPrice:
                    type: number
                  deliveryDays:
                    type: number
                  paymentTerms:
                    type: string
                  warranty:
                    type: string
                  aiSummary:
                    type: string
                  scoreOverall:
                    type: number
        '400':
          description: Bad request
        '500':
          description: Server error


---

# 4. 🤔 Decisions & Assumptions

This section outlines the key architectural decisions, model choices, workflow design, and assumptions made when building this AI-powered RFP system.

## 4.a. Key Design Decisions

### **1. Three-Model Database Structure**
- **Rfp** → Holds structured RFP data generated by AI.
- **Vendor** → Master data for all vendors.
- **Proposal** → Stores parsed vendor email responses + AI scoring.
  
This separation keeps data clean, normalized, and easy to expand.

### **2. Natural Language → Structured JSON Flow**
All unstructured user input (RFP creation + vendor email) is passed through **Google Gemini** with a strict output schema.  
This ensures the frontend always receives predictable JSON.

### **3. Proposal Comparison Logic**
AI is used to:
- Extract comparable fields (price, delivery days, warranty, terms)
- Generate a **score (0–100)**
- Produce a **final recommendation**

The decision to use AI for scoring instead of rule-based logic makes the system more generalizable.

### **4. Email Sending but Simulated Email Receiving**
Sending RFP emails uses Nodemailer.  
For receiving emails, the system intentionally uses a **Vendor Response Simulator** to paste text instead of building Mailgun/SendGrid inbound parsing.  
This simplifies the project scope while still showing AI parsing flow.

### **5. Fetch-Based API Calls**
The frontend uses native `fetch()` instead of Axios to keep the app lightweight and clear.

---

## 4.b. Assumptions Made

### **1. Vendor Responses Are Text-Based**
Assumed that vendors respond with readable text that AI can parse.  
No PDF/OCR support added (but could be extended).

### **2. No Authentication Needed**
This is a **single-user demo**, so login/user accounts were intentionally excluded.

### **3. Email Format Variability**
Assumed emails may be messy or informal — AI is resilient enough to extract structured fields.

### **4. RFP Structure Is Universal**
Assumed all RFPs require:
- Line items  
- Budget  
- Delivery timeline  
- Payment terms  
- Warranty  

This can be extended per industry.

### **5. Scoring Is AI-Driven**
No manual override system was added.  
AI determines:
- Best vendor  
- Reasoning  
- Score breakdown  
---

# 5. 🧠 AI Tools Usage

This project intentionally uses AI tools throughout development to accelerate workflow and improve design quality.

## 5.a. Tools Used
- **Google Gemini** → Core application AI (RFP parsing, proposal parsing, scoring)
- **ChatGPT** → Architecture planning, debugging help, OpenAPI documentation
---

## 5.b. What These Tools Helped With

### **1. Boilerplate Code Generation**
Copilot + ChatGPT helped generate:
- Router boilerplate  
- Model skeletons  

This reduced setup time significantly.

### **2. Debugging and Error Explanation**
AI tools helped quickly diagnose: 
- Nodemailer SMTP configuration errors  
- Incorrect JSON shapes returned by Gemini  

### **3. Schema & Prompt Design**
ChatGPT and Gemini both contributed to: 
- Crafting stable prompts for consistent AI output  

### **4. Improving UX Flow**
AI helped refine decisions like:
- Showing structured preview after generation  
- Using a simulator for vendor responses  




