module.exports = {
  allDepartmentString: () => {
    return `SELECT * FROM department`;
  },

  allRolesString: () => {
    return `SELECT * FROM role r JOIN department d ON r.department_id=d.id ORDER BY r.id ASC;`;
  },
};
