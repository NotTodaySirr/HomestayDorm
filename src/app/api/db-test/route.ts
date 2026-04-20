import { NextResponse } from 'next/server';
import { userRepository } from '../../../lib/repositories/UserRepository';

export async function GET() {
  try {
    // Attempt to query the database using our OOP repository
    const users = await userRepository.findAll();

    return NextResponse.json({
      success: true,
      message: 'Database connection and repository are working!',
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to the database. Make sure DATABASE_URL is set in .env and the database is running.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
