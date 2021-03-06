import moment from 'moment';

import dbQuery from '../db/dev/dbQuery';

import {
    hashPassword,
    comparePassword,
    isValidEmail,
    validatePassword,
    isEmpty,
} from '../helpers/validations';
  
import {
    errorMessage, successMessage, status,
} from '../helpers/status';

/**
   * Create A Rider
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object (of Rider)
   */
  const createRider = async (req, res) => {
    const {
      email, first_name, last_name, password, type
    } = req.body;

    console.log('body: ', req.body)
    console.log('email: ', email)
    console.log('first_name: ', first_name)
    console.log('last_name: ', last_name)
    console.log('password: ', password)
    console.log('type: ', type)


    // const created_on = moment(new Date());
    if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
      errorMessage.error = 'Email, password, first name and last name fields cannot be empty';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!validatePassword(password)) {
      errorMessage.error = 'Password must be more than five(5) characters';
      return res.status(status.bad).send(errorMessage.error);
    }
    // const hashedPassword = hashPassword(password);
    const createRiderQuery = `INSERT INTO
        Rider(email, first_name, last_name, password)
        VALUES($1, $2, $3, $4)
        returning *`;
    const values = [
      email,
      first_name,
      last_name,
      password,
    ];
    const addTypeQuery = (type === 1) ? 'insert into fulltime(id) values($1)' : 'insert into parttime(id) values($1)';
  
    try {
      await dbQuery.query('begin')
      const { rows } = await dbQuery.query(createRiderQuery, values);
      const dbResponse = rows[0];
      await dbQuery.query(addTypeQuery, [dbResponse.id]);
      await dbQuery.query('commit');
      // delete dbResponse.password;
      successMessage.data = dbResponse;
      return res.status(status.created).send(successMessage.data);
    } catch (error) {
      await dbQuery.query('rollback');
      if (error.routine === '_bt_check_unique') {
        errorMessage.error = 'Rider with that EMAIL already exist';
        return res.status(status.conflict).send(errorMessage.error);
      }
      errorMessage.error = 'Operation was not successful';
      console.log('error: ', error);
      return res.status(status.error).send(errorMessage.error);
    }
  };
  
  /**
     * Signin
     * @param {object} req
     * @param {object} res
     * @returns {object} rider object
     */
  const signinRider = async (req, res) => {
    const { email, password } = req.body;
    if (isEmpty(email) || isEmpty(password)) {
      errorMessage.error = 'Email or Password detail is missing';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email or Password';
      return res.status(status.bad).send(errorMessage.error);
    }
    const signinRiderQuery = 'SELECT * FROM Rider WHERE email = $1';
    try {
      const { rows } = await dbQuery.query(signinRiderQuery, [email]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'Rider with this email does not exist';
        console.log(errorMessage);
        return res.status(status.notfound).send(errorMessage.error);
      }
      if (!comparePassword(dbResponse.password, password)) {
        errorMessage.error = 'The password you provided is incorrect';
        return res.status(status.bad).send(errorMessage.error);
      }
      // const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      // delete dbResponse.password;
      successMessage.data = dbResponse;
    //   successMessage.data.token = token;
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };

  /**
 * @params {Object} req
 * @params {Object} res
 * @returns return firstname and Lastname
 */ 

 const searchRiderFirstnameOrLastname = async (req, res) => {
    const { first_name, last_name } = req.query;
    const searchQuery = 'SELECT * from Rider WHERE first_name =$1 OR last_name =$2 ORDER BY id DESC';
    try {
      const { rows } = await dbQuery.query(searchQuery, [first_name, last_name]);
      const dbResponse = rows;
      if (!dbResponse[0]) {
        errorMessage.error = 'No user with such names';
        return res.status(status.notfound).send(errorMessage.error);
      }
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage.data);
    }
    catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);

    }
  };

  /**
   * Edit A Rider
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object (of Customer)
   */
  const editRider = async (req, res) => {
    const {
      email, first_name, last_name, password, id
    } = req.body;

    console.log('body: ', req.body)
    console.log('email: ', email)
    console.log('first_name: ', first_name)
    console.log('last_name: ', last_name)
    console.log('password: ', password)
    console.log('id: ', id)

    if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
      errorMessage.error = 'Email, password, first name and last name fields cannot be empty';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!validatePassword(password)) {
      errorMessage.error = 'Password must be more than five(5) characters';
      return res.status(status.bad).send(errorMessage.error);
    }
    const editRiderQuery = `UPDATE Rider set
        email = $1,
        first_name = $2,
        last_name = $3,
        password = $4
        where id = $5
        returning *`;
    const values = [
      email,
      first_name,
      last_name,
      password,
      id
    ];
  
    try {
      const { rows } = await dbQuery.query(editRiderQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.created).send(successMessage.data);
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        errorMessage.error = 'Rider with that EMAIL already exist';
        return res.status(status.conflict).send(errorMessage.error);
      }
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };

  /**
   * delete a rider
   */
  const deleteRider = async (req, res) => {
    const { id } = req.body;
    const deleteRiderQuery = 'delete from rider where id = $1 returning *';
    try {
      const { rows } = await dbQuery.query(deleteRiderQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };

  /**
   * get no. of orders delivered by rider
   */
  const ordersByRider = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const ordersByRiderQuery = 'select count(id) from delivers where id = $1';
    try {
      const { rows } = await dbQuery.query(ordersByRiderQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get rider's type
   */
  const getRiderType = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const getRiderTypeQuery = "select distinct case when (select count(id) from parttime where id = $1) > 0 then 'pt' else 'ft' end as type from rider;";
    try {
      const { rows } = await dbQuery.query(getRiderTypeQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }
  
  export {
    createRider,
    signinRider,
    searchRiderFirstnameOrLastname,
    editRider,
    deleteRider,
    ordersByRider,
    getRiderType
  };
