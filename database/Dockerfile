FROM php:8.2-apache

# Set timezone
ENV TZ=Europe/Helsinki
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite

# Create and configure directories
RUN mkdir -p /var/lib/php/sessions && \
    mkdir -p /var/www/html/logs && \
    chown -R www-data:www-data /var/lib/php/sessions && \
    chown -R www-data:www-data /var/www/html && \
    chmod 1733 /var/lib/php/sessions && \
    chmod -R 755 /var/www/html && \
    chmod -R 777 /var/www/html/logs

# Set working directory
WORKDIR /var/www/html

# Configure PHP
COPY ./php.ini /usr/local/etc/php/

# Copy custom session configuration
COPY ./custom-session.ini /usr/local/etc/php/conf.d/

# Start Apache
CMD ["apache2-foreground"]