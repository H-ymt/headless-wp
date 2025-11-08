export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
};
