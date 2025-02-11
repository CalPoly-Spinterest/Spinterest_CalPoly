import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getModel } from '../utils/connection';
import { IUser } from '../models/User';
//const User = mongoose.model<IUser & mongoose.Document>('User', UserSchema);

export async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body; // from form
  const User = getModel<IUser>('User');
  console.log(req.body);
  // Check if the username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400).json({ message: 'Username already taken' });
    return;
  } else {
    console.log('gonna bcrypt');
    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        User.create({ username, password: hashedPassword }).then(() => {
          generateAccessToken(username).then((token) => {
            console.log('Token:', token);
            res.status(201).send({ token: token });
          });
        });
      })
      .catch((error) => {
        console.error('Error during registration:', error);
        res.status(500).send('Internal server error');
      });
  }
}

function generateAccessToken(username: string): Promise<string> {
  const secret = process.env.TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      'TOKEN_SECRET is not defined in the environment variables.'
    );
  }

  return new Promise((resolve, reject) => {
    jwt.sign(
      { username },
      secret, // Use the environment variable
      { expiresIn: '1d' },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token as string);
          console.log('in hereeee');
        }
      }
    );
  });
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body; // from form
  const User = getModel<IUser>('User');
  console.log(req.body);

  console.log('i wanna log in');
  if (!username || !password) {
    res.status(400).send('Bad request: Invalid input data.');
    return;
  }
  try {
    // Find user by username and include the password field explicitly
    const user = await User.findOne({ username }).select('+password');

    console.log('User:', user);
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).send({ message: 'Invalid username or password.' });
      return;
    }

    // Generate an access token
    const token = await generateAccessToken(user.username);

    // Send the token as the response
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  // Getting the 2nd part of the auth header (the token)
  const token = authHeader;
  console.log('Auth header:', token);

  if (!token) {
    console.log('No token received');
    res.status(401).end();
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET!, (error, decoded) => {
      if (decoded) {
        next();
      } else {
        console.log('JWT error:', error);
        res.status(401).end();
      }
    });
  }
}
