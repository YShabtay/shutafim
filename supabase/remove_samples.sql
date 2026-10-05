-- מסיר את כל דירות והמשתמשים לדוגמה (הפוסטים והפרופילים נמחקים יחד איתם)
delete from auth.users where email like '%@sample.invalid';
