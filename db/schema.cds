namespace demo;

entity Quotations {
  key ID      : UUID;
  quotationNo : String(10);
  customer    : String(100);
  amount      : Decimal(15,2);
  currency    : String(3) default 'INR';
  status      : String(20) default 'OPEN';
}