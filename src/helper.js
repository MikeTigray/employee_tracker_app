module.exports = {
  allDepartmentString: () => {
    return `SELECT * FROM department`;
  },

  allRolesString: () => {
    return `SELECT r.id,r.title,d.name AS department,r.salary FROM role r JOIN department d ON r.department_id=d.id ORDER BY r.id ASC;`;
  },
  allEmployeesString: () => {
    return `SELECT e.id, e.first_name, e.last_name, r.title,d.name, r.salary, m.first_name AS Manager FROM employee e JOIN role r ON r.id=e.role_id JOIN homework.department d ON r.department_id=d.id LEFT JOIN employee m ON e.manager_id=m.id ORDER BY e.id ASC;`;
  },
};
