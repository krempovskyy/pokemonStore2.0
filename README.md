# pokemonStore2.0
Pokémon Merchandise Online Shop - Team Number 9



1.	Vinh Nguyen
2.	Lien Pham
3.	Dmytro Krempovskyy
4.	Madushani Piyadasa

A brief description of our web development project.

# Title : Pokémon Merchandise Online Shop

## Objective ## 

The Pokémon merchandise online shop project aims to create a user-friendly, engaging, and visually appealing e-commerce platform for fans of the Pokémon franchise.  

Background

This website will serve as a one stop shop for purchasing official Pokémon themed merchandise, including clothing, accessories, toys, collectibles and more. The platform will prioritize usability, accessibility, and a seamless shopping experience to cater to Pokémon enthusiasts. 

Table of Contents
•	Features
•	Database Tables
•	Created Forms
•	Created Tables
________________________________________
## Features
Functionality of the project is described as below, 

1.	Feature 1 - Dmytro Krempovskyy and Madushani – User Authentication & Account Management


2.	Feature 2 - Product Listing and Categories
    > Product Display System
      - Responsive product grid layout
      - Interactive product cards
      - Dynamic category badges
      - Smooth hover animations
      - Price and stock indicators
    
    > Quick Review Features
      - Modal-based product preview
      - Image gallery with thumbnails
      - Detailed product specifications
      - Mobile-friendly interactions
      - Zoom functionality for product images
    
    > Category Management
      - Organized product categories
      - Easy navigation structure
      - Category-based filtering
      - Dynamic category updates

    ### Files Structure
    ```
    products/
      ├── toys.php           - Toys category page
      ├── clothes.php        - Clothes category page
      ├── js/
      │   └── products.js    - Product display and interactions
      └── css/
          └── products.css   - Product styling and layouts
    ```

### Contributors
- **Vinh Nguyen** - Filter system & interactions
- **Lien Pham** - Product grid & UI design

3.	Feature 3 – Madushani Piyadasa – Contact Page

    > A contact form allow users to send inqueries and Feedback

    > Includes fields for name, e-mail, subject and message
     
    > Javacsript validation to ensure form compeleteness

4.	Feature 4 - Vinh Nguyen / Lien Pham - Search & Filters
    > Advanced search functionality with real-time results
      - Product name and description search
      - Category-based filtering
      - Instant search suggestions
    
    > Comprehensive filter system
      - Price range slider with min/max values
      - Brand/type filtering (Pokemon/Figure)
      - Category-specific filters
      - Multiple filter combinations support
    
    > User-friendly interface
      - Clear filter indicators
      - Easy filter reset options
      - Mobile-responsive filter menu
      - Smooth animations and transitions

    ### Files Structure
    ```
    js/
      ├── products.js       - Search bar implementation and Filter components
    ```

    ### Contributors
    - **Vinh Nguyen**
    - **Lien Pham**


6. Feature 6 – Vinh Nguyen  - Admin site
    > Secure admin dashboard with authentication
    > Product management system (CRUD operations)
      - Add new products with images, details, and pricing
      - Edit existing product information
      - Remove products from inventory
      - Bulk product management capabilities
    > Order management and tracking
      - View all customer orders
      - Update order status
      - Process refunds when needed
    > User management interface
      - View registered users
      - Manage user roles and permissions
    > Analytics dashboard
      - Orders tracking
      - Products tracking
      - Revenue reports

    ### Files Structure
    ```
    admin/
      ├── dashboard.php        - Main admin dashboard
      ├── products/
      │   ├── add.php         - Add new products
      │   ├── edit.php        - Edit existing products
      │   └── manage.php      - Product management overview
      ├── orders/
      │   ├── list.php        - Order listing and management
      │   └── details.php     - Detailed order view
      ├── users/
      │   └── manage.php      - User management interface
      ├── js/
      │   ├── admin.js        - Admin dashboard functionality
      │   └── products.js     - Product management scripts
      └── css/
          └── admin.css       - Admin interface styling
    ```

7.	Feature 7 - Responsive and Accessible Design

    > Optimized for Mobile, Tablet and Desktop users 


_______________________________________

## Database Tables

Below is the planned database structure

| **Table Name**     | **Created By**           | **Description**  
| -----------        | ----------               | ------------   
| Users              | Dmytro                   | Stores User Information
| Products           | Vinh/Lien                | Stores Products Infomation                
| Contact            | Madu                     | Stores User Inquery   




![ER diagram](images/ER.png)
________________________________________

## # Created Forms

List of forms include in the project

|**Form name**        | **Created by** | **Description**                  | **Validation Applied**
|---------------      | -----------    | ---------------                  | ---------------------
| Registration        | Dmytro         | Allow users to create accounts   | E-mail & password validation 
| Login form          | Dmytro and Madu        | User authentication              | Required fields and password encryption 
| Product upload form | Vinh/ Lien     | Admin adds new products          | Image validation and required fields 
| Contact form        | Madu           | User submit inquiries            | Required fields and email validation 

________________________________________


 






 
