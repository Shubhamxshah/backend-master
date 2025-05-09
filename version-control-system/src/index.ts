import express from "express";
import crypto from 'crypto';
import { v4 as uuidv4 } from "uuid";

export const app = express();
app.use(express.json());

const repositories: Map<string, Repository> = new Map();

interface ChangeSet {
  [filename: string]: string;
}

class Commit {
  id: string; 
  message: string;
  parent: string | null;
  timestamp: number;
  changes: Map<string, string>;

  constructor (message: string, parent: string | null = null) {
    this.id = crypto.createHash('sha1').update(Date.now().toString()).digest('hex');
    this.message = message;
    this.parent = parent;
    this.timestamp = Date.now();
    this.changes = new Map();
  }
}

class Repository {
  id: string;
  commits: Map<string, Commit>;
  branches: Map<string, string | null>;
  head: string | null;
  workingDirectory: Map<string, string>;

  constructor (id: string) {
    this.id = id;
    this.commits = new Map();
    this.branches = new Map();
    this.head = null;
    this.workingDirectory = new Map();
  }
}

// Initialize a repository 
app.post('/api/repo/init', (_, res) => {
  const repoId = uuidv4();
  const repo = new Repository(repoId);
  repo.branches.set('main', null);
  repo.head = 'main';
  repositories.set(repoId, repo);
  res.json({ repoId, message: 'Repository initialized'});
})

// commit changes 
app.post("/api/repo/:id/commit", (req, res) => {
  const {id} = req.params; 
  const {message, changes} = req.body;
  const repo = repositories.get(id);
  if (!repo) {
    res.status(404).json({error: "Repository not found"})
    return;
  }
  if (typeof repo.head !== "string") {
    return;
  }

  const parent = repo.branches.get(repo.head);
  const commit = new Commit(message, parent);
  commit.changes = new Map(Object.entries(changes));

  repo.commits.set(commit.id, commit);
  repo.branches.set(repo.head, commit.id); 

  for (const [file, content] of commit.changes.entries()){
    repo.workingDirectory.set(file, content);
  }

  res.json({ commitId: commit.id, message: 'Changes committed'})
})
