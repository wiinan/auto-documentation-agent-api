export type ConfigDto = {
  type?: 'postgres';
  host?: string;
  port: number;
  username?: string;
  password?: string;
  database?: string;
  entities?: Array<string>;
  synchronize: boolean;
  autoLoadEntities: boolean;
  migrations: Array<string>;
};
