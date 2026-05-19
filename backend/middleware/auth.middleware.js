import bcrypt from "bcrypt";

export async function hashPassword(next) {
  if (!this.isModified("password"))
    return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
}


export async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}
