USE employee_tracker;

INSERT INTO department(name)
VALUES("Engineering"),
	  ("Finance"),
	  ("Legal"),
	  ("Sales");

INSERT INTO employee(first_name,last_name,role_id,manager_id)
VALUES 
("Mike","Abay",1,null),
("Lionel","Messi",2,1),
("Gabriel","Jesus",3,null),
("Thomas","Partey",4,3),
("Eric","Dier",5,null),
("Martin","Odegaard",6,5),
("kieran","Tierney",7,null),
("Harry","Kane",8,7);

INSERT INTO role(title,salary,department_id)
VALUES
("Sales Lead",100000,4),
("Sales Person",80000,4),
("Lead Engineer",100000,1),
("Software Engineer",100000,1),
("Accountant Manager",100000,2),
("Accountant",100000,2),
("Legal Team Lead",250000,3),
("Lawyer",190000,3);

