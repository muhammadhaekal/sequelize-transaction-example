const models = require("./../models")
const bcrypt = require('bcryptjs')
const moment = require('moment')
const jwt = require("jsonwebtoken")


module.exports = {
    // ---------------------------------------------------------------------------
    // GET /accounts
    get: (req, res) => {
        models.accounts.findAll({ limit: 100 }).then(employee => {
            if (employee === null) {
                return res.send({
                    message: "data not fund"
                })
            }

            res.send({
                data: employee
            })
        })
    },
    // ---------------------------------------------------------------------------
    // GET /accounts/login
    login: async (req, res) => {

        try {

            //1. find the accunt
            let account = await models.accounts.findOne({ where: { email: req.body.email } }).then(account => account)

            //2. check if the account is exist
            if (account === null) {
                return res.send({
                    message: "account not fund"
                })
            }
            console.log("body.password", req.body.password)
            console.log("account.password", account.password)

            //3. password validation
            const validPassword = bcrypt.compareSync(
                req.body.password,
                account.password
            )
            if (!validPassword) {
                return res.send({
                    message: "password is not valid"
                })
            }

            //4. create payload
            let token_data = {}
            token_data.payload = {
                id: account.emp_no,
                emp_no: account.emp_no,
                email: account.email
            }
            token_data.secret = process.env.JWT_SECRET
            token_data.options = {
                expiresIn: "30d" // EXPIRATION: 30 days
            }
            const token = jwt.sign(token_data.payload, token_data.secret, token_data.options)
            res.send({
                message: "You are logged in",
                email: req.body.email,
                token: token
            })



        } catch (err) {
            res.send({
                message: "error",
                error: err
            })
        }

    },
    // ---------------------------------------------------------------------------
    // GET /employees/:emp_no
    getById: (req, res) => {
        req.params.emp_no = JSON.parse(req.params.emp_no)
        models.employees.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => {
            if (employee === null) {
                return res.send({
                    message: "data not fund"
                })
            }

            res.send({
                data: employee
            })
        })
    },
    // ---------------------------------------------------------------------------
    // POST /accounts/register
    register: async (req, res) => {
        const SALT_WORK_FACTOR = 10
        let employee_data = {}
        let accounts_data = {}

        //1. manual auto increment using nodejs (you can use SequelizeJs model / mysql auto increment)
        let max_emp_no = await models.employees.max("emp_no").then(max => max + 1)
        employee_data.emp_no = max_emp_no

        //2. manual set hire date to current date (you can use SequelizeJs model / mysql auto increment)
        if (!req.body.hire_date) {
            const today = moment().format('YYYY-MM-DD')
            employee_data.hire_date = today
        }

        //3. get all employee data from req.body
        Object.keys(req.body).map(key => {
            if (key !== "email" && key !== "password") {
                employee_data[key] = req.body[key]
            }
        })

        //4. get all accounts data from req.body
        Object.keys(req.body).map(key => {
            if (key === "email" || key === "password") {
                accounts_data[key] = req.body[key]
            }
        })

        //5. generate account salt, hashed password
        const sequelize = models.sequelize
        accounts_data.password_salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
        accounts_data.password = bcrypt.hashSync(accounts_data.password, accounts_data.salt);
        accounts_data.emp_no = max_emp_no

        //6. insert employee data and account data into one sql transaction
        sequelize.transaction((t) => {
            // chain all your queries here. make sure you return them.
            return models.employees.create(employee_data, { transaction: t }).then((user) => {
                return models.accounts.create(accounts_data, { transaction: t });
            });

        }).then((result) => {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
            //7. generate token
            let token_data = {}
            token_data.payload = {
                id: employee_data.emp_no,
                emp_no: employee_data.emp_no,
                email: accounts_data.email
            }
            token_data.secret = process.env.JWT_SECRET
            token_data.options = {
                expiresIn: "30d" // EXPIRATION: 30 days
            }

            const token = jwt.sign(token_data.payload, token_data.secret, token_data.options)
            res.send({
                message: "insert employee data and user data success",
                data: {
                    employee: employee_data,
                    accounts_data: accounts_data,
                    token: token
                }
            })
        })

    },
    // ---------------------------------------------------------------------------
    // PUT /employees/:emp_no
    put: async (req, res) => {
        req.params.emp_no = JSON.parse(req.params.emp_no)

        models.employees.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => {
            if (employee) {
                return employee.update(req.body).then(updated_employee => res.send({
                    message: "update data success",
                    data: updated_employee
                })).catch(err => Promise.reject(err))
            } else {
                res.send({
                    message: "data not found",
                })
            }
        }).catch(err => {
            res.send({
                message: "error",
                error: err
            })
        })


        // using async await
        // try {
        //     let employee = await models.employees.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => employee)

        //     if (employee) {
        //         await employee.update(req.body).then(updated_employee => res.send({
        //             message: "update data success",
        //             data: updated_employee
        //         }))
        //     } else {
        //         res.send({
        //             message: "data not found",
        //         })
        //     }
        // } catch (err) {
        //     res.send({
        //         message: "error",
        //         error: err
        //     })
        // }

    },
    // ---------------------------------------------------------------------------
    // DELETE /employees/:emp_no
    deleteById: async (req, res) => {
        req.params.emp_no = JSON.parse(req.params.emp_no)

        models.employees.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => {
            if (employee) {
                return employee.destroy().then(deleted_employee => res.send({
                    message: "delete data success",
                    data: deleted_employee
                })).catch(err => Promise.reject(err))
            } else {
                res.send({
                    message: "data not found",
                })
            }
        }).catch(err => {
            res.send({
                message: "error",
                error: err
            })
        })

        // using async await
        // try {
        //     let employee = await models.employees.findOne({ where: { emp_no: req.params.emp_no } }).then(employee => employee)

        //     if (employee) {
        //         await employee.destroy().then(deleted_employee => res.send({
        //             message: "delete data success",
        //             data: deleted_employee
        //         }))
        //     } else {
        //         res.send({
        //             message: "data not found",
        //         })
        //     }
        // } catch (err) {
        //     res.send({
        //         message: "error",
        //         error: err
        //     })
        // }
    },
    // ---------------------------------------------------------------------------
    // GET /employees/search
    search: (req, res) => {
        let filter = {}
        //check offset
        if (req.query.limit) {
            filter.limit = JSON.parse(req.query.limit)
        } else {
            filter.limit = 100
        }

        //check page
        if (req.query.offset) {
            filter.offset = JSON.parse(req.query.offset)
        }

        //check sort
        if (req.query.sort) {
            //get sorting from query url
            //1. split all sort query
            let splitted_sort = req.query.sort.split("_")
            console.log("after split", splitted_sort)
            //2. get last char after _ (_asc or _desc)
            let sort_by = splitted_sort[splitted_sort.length - 1]
            console.log("sort_by", sort_by)
            //3. remove last item from array
            splitted_sort.pop()
            //4. join all char before (_asc or _desc)
            console.log(splitted_sort)
            let column = splitted_sort.join("_")

            if ((sort_by === "asc") || (sort_by === "desc")) {
                //create order object and array inside 
                filter.order = []
                filter.order.push([column, sort_by])
            } else {
                return res.send({
                    message: "error",
                    error: "wrong sorting format"
                })
            }
        }

        // get filter from query parameter
        filter.where = {}
        Object.keys(req.query).map(key => {
            if (key !== "limit" && key !== "offset" && key !== "sort") {
                filter.where[key] = req.query[key]
            }
        })

        models.employees.findAndCountAll(filter).then(employee => res.send({
            filter: filter,
            data: employee
        })).catch(error => res.send({
            message: "error",
            error: error
        }))
    },
}
