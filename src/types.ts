export interface Product {
  id: string;
  name: string;
  number: string;
  link: string;
  image: string;
  category: string;
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}
