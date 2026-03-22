import { Octokit } from "octokit";
import { Product, GitHubConfig } from "../types";

export class GitHubService {
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.token });
  }

  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: "products.json",
        ref: this.config.branch,
      });

      if ("content" in response.data) {
        const content = atob(response.data.content);
        return JSON.parse(content);
      }
      return [];
    } catch (error: any) {
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async saveProducts(products: Product[]): Promise<void> {
    let sha: string | undefined;
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: "products.json",
        ref: this.config.branch,
      });
      if ("sha" in response.data) {
        sha = response.data.sha;
      }
    } catch (error) {}

    const content = btoa(JSON.stringify(products, null, 2));

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner: this.config.owner,
      repo: this.config.repo,
      path: "products.json",
      message: "Update products list",
      content,
      sha,
      branch: this.config.branch,
    });
  }

  async uploadImage(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(",")[1];
        const fileName = `images/${Date.now()}-${file.name}`;
        
        try {
          await this.octokit.rest.repos.createOrUpdateFileContents({
            owner: this.config.owner,
            repo: this.config.repo,
            path: fileName,
            message: `Upload image: ${file.name}`,
            content: base64Content,
            branch: this.config.branch,
          });
          
          // Construct the raw URL for the image
          const url = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${fileName}`;
          resolve(url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
