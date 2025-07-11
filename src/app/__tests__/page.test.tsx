import { render, screen } from "@testing-library/react";
import Home from "../page";
import { mockProject } from "./test-utils";

// Mock getHomePageProjects
jest.mock("@/utils/projects", () => ({
  getHomePageProjects: jest.fn(() => ({
    featured: [
      {
        ...mockProject,
        title: "Featured Project",
        description: "A featured project description",
      },
      {
        ...mockProject,
        title: "Featured Project Without Image",
        description: "A featured project without an image",
        image: undefined,
      },
    ],
    recent: [],
  })),
}));

// Mock fs for site settings
jest.mock("fs/promises", () => ({
  readFile: jest.fn().mockResolvedValue(
    JSON.stringify({
      title: "Chris Hacker",
      description: "Investigative Data Journalist & Engineer",
      author: "Chris Hacker",
      socialLinks: {
        github: "https://github.com/cmhac",
        linkedin: "#",
        twitter: "#",
      },
    }),
  ),
}));

// Mock the ProjectCard component
jest.mock("@/components/ProjectCard", () => {
  return function MockProjectCard({ project }: { project: any }) {
    return (
      <div data-testid="project-card">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {project.image && <img src={project.image} alt={project.title} />}
        <a href={project.url}>$ explore project</a>
      </div>
    );
  };
});

describe("Home Page", () => {
  it("renders hero section with title and description", async () => {
    render(await Home());

    // Check headshot image
    const headshot = screen.getByRole("img", { name: "Chris Hacker" });
    expect(headshot).toBeInTheDocument();
    expect(headshot.closest("div")).toHaveClass(
      "relative",
      "w-32",
      "h-32",
      "overflow-hidden",
      "rounded-full",
    );

    const title = screen.getByText("Chris Hacker");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("text-terminal-cyan", "whitespace-nowrap");

    const description = screen.getByText(
      "Investigative Data Journalist & Engineer",
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-terminal-text");
    expect(description).not.toHaveClass("whitespace-nowrap");

    // Check header container has proper layout and constraints
    const header = screen.getByRole("heading", { level: 1 });
    expect(header).toHaveClass(
      "flex",
      "flex-wrap",
      "justify-center",
      "gap-2",
      "min-h-[3.5rem]",
      "items-center",
      "max-w-[90vw]",
      "mx-auto",
    );
  });

  it("ensures proper text wrapping behavior", async () => {
    render(await Home());

    // Author name and separator should not wrap
    const authorName = screen.getByText("Chris Hacker");
    const separator = screen.getByText("|", { exact: false });
    const authorSpan = authorName.closest("span");
    const separatorSpan = separator.closest("span");

    expect(authorSpan).toHaveClass("whitespace-nowrap");
    expect(separatorSpan).toHaveClass("whitespace-nowrap");

    // Description should be allowed to wrap
    const description = screen.getByText(
      "Investigative Data Journalist & Engineer",
    );
    expect(description.closest("span")).not.toHaveClass("whitespace-nowrap");
  });

  it("renders navigation links with correct styling", async () => {
    render(await Home());

    const viewProjectsLink = screen.getByText("View Projects");
    expect(viewProjectsLink).toHaveClass(
      "bg-terminal-purple/20",
      "text-terminal-purple",
      "border",
      "border-terminal-purple",
    );

    const aboutMeLink = screen.getByText("About Me");
    expect(aboutMeLink).toHaveClass(
      "bg-terminal-cyan/20",
      "text-terminal-cyan",
      "border",
      "border-terminal-cyan",
    );
  });

  it("renders featured projects section with terminal styling", async () => {
    render(await Home());

    const sectionTitle = screen.getByText("featured projects");
    expect(sectionTitle).toHaveClass("text-terminal-purple");

    const projectCards = screen.getAllByTestId("project-card");
    expect(projectCards).toHaveLength(2);

    const projectTitles = [
      "Featured Project",
      "Featured Project Without Image",
    ];
    projectTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders project cards with terminal-style links", async () => {
    render(await Home());
    const projectLinks = screen.getAllByText("$ explore project");
    expect(projectLinks[0]).toHaveAttribute("href", "https://example.com");
    expect(projectLinks[1]).toHaveAttribute("href", "https://example.com");

    const exploreAllLink = screen.getByText("➜ explore all projects");
    expect(exploreAllLink).toHaveAttribute("href", "/projects");
    expect(exploreAllLink).toHaveClass(
      "bg-terminal-selection/30",
      "text-terminal-text",
      "border",
      "border-terminal-selection",
    );
  });

  it("renders project cards with and without images", async () => {
    render(await Home());

    // Check first project with image
    const projectWithImage = screen
      .getByText("Featured Project")
      .closest("div[data-testid='project-card']");
    const image = projectWithImage?.querySelector("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/media/test.png");
    expect(image).toHaveAttribute("alt", "Featured Project");

    // Check second project without image
    const projectWithoutImage = screen
      .getByText("Featured Project Without Image")
      .closest("div[data-testid='project-card']");
    expect(projectWithoutImage?.querySelector("img")).not.toBeInTheDocument();
  });
});
