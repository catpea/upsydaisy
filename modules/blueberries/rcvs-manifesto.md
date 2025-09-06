# Right Click View Source Manifesto
RCVSM
## Preamble

In an era where the complexity of web development has reached unprecedented heights, we stand at a crossroads. The foundational principles of the web—simplicity, transparency, and accessibility of information—are at risk of being overshadowed by frameworks and abstractions that prioritize developer convenience over clarity. This manifesto advocates for a return to a more readable, maintainable, and intuitive approach to HTML through the adoption of web components as the cornerstone of modern web development.

## Principles

### 1. **Code Readability as a Priority**

We believe that code should be as readable as a well-written book. The ability to understand and navigate code should not require extensive training or specialized knowledge. By embracing web components, we can create self-contained, descriptive elements that clearly communicate their purpose and functionality, making the codebase more approachable for developers of all skill levels.

### 2. **Encapsulation and Modularity**

Web components allow for the encapsulation of functionality and styling, promoting modular design. This modularity enables developers to build applications in a more organized manner, reducing the cognitive load associated with understanding sprawling codebases. Each component can be developed, tested, and maintained independently, fostering a culture of collaboration and innovation.

### 3. **Simplicity in Structure**

The web was founded on the principle of "Right Click > View Source," emphasizing the importance of transparency and simplicity. We advocate for a structure that reflects this principle, where the HTML is straightforward and intuitive. By minimizing unnecessary nesting and div soup, we can create a clearer hierarchy that is easy to follow and understand.

### 4. **Dynamic and Interactive Experiences**

Web components empower developers to create dynamic and interactive user experiences without sacrificing code clarity. By leveraging the capabilities of modern JavaScript within these components, we can build rich interfaces that are both engaging and maintainable. This approach allows for the seamless integration of functionality while keeping the underlying code clean and comprehensible.

### 5. **A New Era of Collaboration**

As we embrace web components, we foster a new era of collaboration among developers, designers, and stakeholders. The clear and modular nature of components encourages cross-functional teams to work together more effectively, leading to better outcomes and a more cohesive product. This collaborative spirit is essential for driving innovation and pushing the boundaries of what is possible on the web.

### 6. **A Call to Action**

We call upon developers, organizations, and educators to adopt this manifesto as a guiding principle in their work. Let us champion the use of web components as the foundation for our web applications, prioritizing code readability, encapsulation, and simplicity. Together, we can create a web that is not only powerful and dynamic but also accessible and understandable to all.

The "Right Click View Source Manifesto" serves as a rallying cry for a new way of thinking about HTML and web development. By embracing web components and prioritizing readability and simplicity, we can build a more sustainable and collaborative future for the web. Let us return to the roots of the web, where clarity and transparency reign supreme, and where every developer can confidently say, "I understand this code."






---









# The Right Click View Source Manifesto (RCVS Manifesto)

## Preamble

In an era where the complexity of web development has reached unprecedented heights, we stand at a crossroads. The foundational principles of the web—simplicity, transparency, and accessibility of information—are at risk of being overshadowed by frameworks and abstractions that prioritize developer convenience over clarity. This manifesto advocates for a return to a more readable, maintainable, and intuitive approach to HTML through the adoption of web components as the cornerstone of modern web development.

## Principles

### 1. **Code Readability as a Priority**

We believe that code should be as readable as a well-written book. The ability to understand and navigate code should not require extensive training or specialized knowledge. By embracing web components, we can create self-contained, descriptive elements that clearly communicate their purpose and functionality, making the codebase more approachable for developers of all skill levels.

### 2. **Encapsulation and Modularity**

Web components allow for the encapsulation of functionality and styling, promoting modular design. This modularity enables developers to build applications in a more organized manner, reducing the cognitive load associated with understanding sprawling codebases. Each component can be developed, tested, and maintained independently, fostering a culture of collaboration and innovation.

### 3. **Simplicity in Structure**

The web grew on the magid of "Right Click > View Source," emphasizing the importance of transparency and simplicity. We advocate for a structure that reflects this principle, where the HTML is straightforward and intuitive. By minimizing unnecessary nesting and div soup, we can create a clearer hierarchy that is easy to follow and understand.

### 4. **Dynamic and Interactive Experiences**

Web components empower developers to create dynamic and interactive user experiences without sacrificing code clarity. By leveraging the capabilities of modern JavaScript within these components, we can build rich interfaces that are both engaging and maintainable. This approach allows for the seamless integration of functionality while keeping the underlying code clean and comprehensible.

### 5. **The Teenage Developer**

Our guiding light and source of wisdom in moments of confusion and ambiguity is the curious teenager. The best solution is the one that helps a young teenager understand the code in the simplest possible way. We enshrine the Teenage Developer as a principle of this manifesto, recognizing that they are the future of our industry. By providing clear, well-named elements and intuitive structures, we can empower them to learn and grow.

We advocate for the integration of AI tutoring systems that prioritize simplicity and clarity, guiding young developers through the complexities of coding. This mentorship will help them navigate challenges and foster a love for programming, ultimately advancing human potential.

### 6. **A New Era of Collaboration**

As we embrace web components, we foster a new era of collaboration among developers, designers, and stakeholders. The clear and modular nature of components encourages cross-functional teams to work together more effectively, leading to better outcomes and a more cohesive product. This collaborative spirit is essential for driving innovation and pushing the boundaries of what is possible on the web.

We must also include the Teenage Developer in this collaboration, ensuring that their voices are heard and their needs are met. By creating an environment that welcomes their curiosity and creativity, we can inspire the next generation of developers.

### 7. **A Call to Action**

We call upon developers, organizations, and educators to adopt this manifesto as a guiding principle in their work. Let us champion the use of web components as the foundation for our web applications, prioritizing code readability, encapsulation, and simplicity. Together, we can create a web that invites those new to programming to learn from source code, which they can view via right click.

By fostering an inclusive environment that supports the Teenage Developer, we can help lift them out of poverty and empower them to contribute to the advancement of humankind. Let us build a future where every curious mind has the opportunity to thrive in the world of technology.

The "RCVS Manifesto" serves as a rallying cry for a new way of thinking about HTML and web development. By embracing web components and prioritizing readability and simplicity, we can build a more sustainable and collaborative future for the web. Let us return to the roots of the web, where clarity and transparency reign supreme, and where every developer, especially the teenagers of today, can confidently say, "I understand this code."

Adding examples to the RCVS Manifesto is a fantastic idea! Code snippets can serve as powerful illustrations of the principles outlined in the manifesto, making the concepts more tangible and relatable for both teenage and senior developers. By showcasing practical implementations, you can effectively communicate the vision of a more readable and maintainable web.

## Code as a Language of Ideas

To further illustrate the principles of the RCVS Manifesto, we present a practical example that embodies the concepts of readability, encapsulation, and modularity through the use of web components and CSS Grid.

### CSS Grid Example: Sidebar Application

```html
<style>
  web-application.sidebar-application {
    box-shadow: 2px 0 24px 0 rgba(0, 0, 0, 0.3);
    width: 100%;
    display: grid;
    grid-template-areas:
      "brand search  profile"
      "menu  alert   properties"
      "menu  main    properties"
      "foot  foot    foot";
    grid-template-rows: auto;
    grid-template-columns: 1fr;

    > header {
      grid-area: brand;
    }
    > search-form {
      grid-area: search;
    }
    > user-info {
      grid-area: profile;
    }
    > nav {
      grid-area: menu;
    }
    > alert-region {
      grid-area: alert;
    }
    > details {
      grid-area: properties;
    }
    > main {
      grid-area: main;
    }
    > footer {
      grid-area: foot;
    }
  }
</style>

<web-application class="sidebar-application">
  <header>
    <img src="logo.svg" alt="App Logo">
  </header>

  <!-- Search box -->
  <search-form placeholder="Search…"></search-form>

  <!-- Profile / user info -->
  <user-info fullname="Jane Doe" username="jdoe" avatar="jdoe.png"></user-info>

  <!-- Main navigation menu -->
  <nav>
    <ul>
      <li><a href="#">Dashboard</a></li>
      <li><a href="#">Projects</a></li>
    </ul>
  </nav>

  <!-- Alerts / notifications -->
  <alert-region></alert-region>

  <!-- Properties / inspector panel -->
  <details>
    <h2>Properties</h2>
    <!-- content -->
  </details>

  <!-- Main workspace -->
  <main>
    <h1>Welcome</h1>
    <p>Main application content goes here.</p>
  </main>

  <!-- Footer -->
  <footer>
    <small>&copy; 2025 MyCompany</small>
  </footer>
</web-application>
```

### Explanation of the Example

This example demonstrates how to create a sidebar application layout using CSS Grid and custom web components. Each component is clearly defined, making it easy to understand the structure and purpose of the application.

- **Encapsulation**: Each custom element (e.g., `<search-form>`, `<user-info>`, `<alert-region>`) encapsulates its functionality, promoting modularity and reusability.
- **Readability**: The CSS Grid layout is straightforward, allowing developers to quickly grasp how the layout is organized without excessive complexity.
- **Simplicity**: The use of descriptive element names and a clear grid structure aligns with our principle of making code accessible and understandable, especially for young developers.
