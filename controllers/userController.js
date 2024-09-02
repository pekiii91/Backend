const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, passwordConfirmation } = req.body;

    if (password != passwordConfirmation) {
      return res.status(400).send({ error: "Password do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await user.create({ email, password: hashedPassword });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await user.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: "Invalid login credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};
