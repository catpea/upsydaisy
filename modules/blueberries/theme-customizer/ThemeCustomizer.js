import { fromInput, derived, effect } from "#ladybits";
import { Disposables } from "../util/Disposables.js";
import { DisposableEventListener } from "../util/DisposableEventListener.js";

// we must use the template element as it only requires: shadow.appendChild(template.content.cloneNode(true));
const template = document.createElement("template");
// we use html`` as it enables syntax higlighiting in zed editor
template.innerHTML = html`
  <style>
    :host {
      display: grid;
      grid-template-areas:
        "head head"
        "nav  main"
        "foot foot";
      grid-template-rows: 50px 1fr;
      grid-template-columns: 150px 1fr;
      gap: 1em;
    }

    header {
      grid-area: head;
    }
    nav {
      grid-area: nav;
    }
    main {
      grid-area: main;
    }
    aside {
      grid-area: aside;
    }
    footer {
      grid-area: foot;
    }
  </style>

  <nav>
    <level-builder id="levelBuilder"></level-builder>
  </nav>

  <main>

    <section data-title="Design View">
      <horizontal-view>

        <section style="width: 12rem; hmin-eight: 15rem; border-radius: 8px;">
          <link href="style.css" rel="stylesheet" />
          <link-style event="generated"></link-style>

          <div class="preview" style="--preview-scale: .9;">
            <div class="card up">
              level 1
              <div class="card up">
                level 2
                <div class="card up">
                  level 3
                  <div class="card up">
                    level 4
                    <div class="card up">level 5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style="--border-radius: 0; border-radius: var(--border-radius); width: max(320px, 25vw); height: 320px; padding-right: 1rem;">
          <link href="style.css" rel="stylesheet" />
          <link href="application.css" rel="stylesheet" />

          <link-style event="generated"></link-style>

          <div class="preview" style="--preview-scale: .4;">
            <web-application class="sidebar-application theme1">
              <header>My Application</header>

              <figure>
                <img src="logo.svg" alt="App Logo" />
              </figure>

              <!-- Search box -->
              <search-form placeholder="Search…">searchform</search-form>

              <!-- Profile / user info -->
              <user-info fullname="Jane Doe" username="jdoe" avatar="jdoe.png">user info</user-info>

              <!-- Main navigation menu -->
              <nav>
                <ul>
                  <li><a href="#">Dashboard</a></li>
                  <li><a href="#">Projects</a></li>
                </ul>
              </nav>

              <!-- Alerts / notifications -->
              <alert-region> INFO: Action Complete </alert-region>

              <!-- Properties / inspector panel -->
              <aside>
                <h2>Properties</h2>
                <!-- content -->
              </aside>

              <!-- Main workspace -->
              <main>
                <h1>Welcome</h1>
                <p style="min-height: 20rem;">Main application content goes here.</p>
              </main>

              <!-- Footer -->
              <footer>
                <small>&copy; 2025 MyCompany</small>
              </footer>
            </web-application>
          </div>
        </section>

        <section style="--border-radius: 8px; border-radius: var(--border-radius); width: max(320px, 25vw); height: 320px;">
          <link href="style.css" rel="stylesheet" />
          <link-style event="generated"></link-style>

          <!--<div class="preview">
              <div style=" width: 100%; height: 100px; border: 16px solid red;">
                this square is 100% wide, 50px tall (because it is scale .5) and the border is 8px.
                it fills the preview container completely.
              </div>
            </div>-->

          <div class="preview">
            <div class="up" style="background-color: var(--background); padding: 2rem;  ">
              <div class="card up">
                <div class="up" style="background-color: var(--background); padding: 2rem;">
                  <h4 class="up" style="background-color: var(--background); padding: 2rem; border-radius: 8px;"><b>John Doe</b></h4>
                  <p>Architect & Engineer</p>
                  <p>Innovative and detail-oriented Architect & Engineer with over 15 years of experience in high-stakes projects, including the highly classified and groundbreaking initiative that successfully faked the Moon Landing. Collaborated with a quirky mix of aerospace companies and government agencies, including LunarTech Innovations and Starlight Dynamics, to design and implement elaborate structures and engineering solutions that made it all look real.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                  <p>Expert in project management, with a proven track record of delivering "out-of-this-world" projects on time and within budget. Committed to pushing the boundaries of engineering and architecture, all while keeping a wink and a nod to the absurdity of it all.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: CadetBlue;"></div>
        </section>

        <section>
          <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: DarkCyan;"></div>
        </section>

        <section>
          <div class="card" style="width: 18rem; height: 15rem; border-radius: 8px; background-color: LightSeaGreen;"></div>
        </section>

      </horizontal-view>

    </section>

    <section data-title="Grid View"></section>
    <theme-grid id="themeGrid"></theme-grid>

  </main>


  <aside>
  </aside>

  <footer>
    <!--
  for when a cell is selected in the theme grid
  <gradient-builder id="gradientBuilder"></gradient-builder>
  -->
  </footer>
`;

export class ThemeCustomizer extends HTMLElement {
  #colorStops;

  #disposables;
  constructor() {
    super();
    this.#disposables = new Disposables();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.appendChild(template.content.cloneNode(true));

    // Initialize with default gradient
    this.#colorStops = [
      { percentage: 0, color: "#03141C" },
      { percentage: 55, color: "#3B9C93" },
      { percentage: 100, color: "#083145" },
    ];

    const stopsJson = JSON.stringify(this.#colorStops);
    this.levelBuilder = shadow.querySelector("#levelBuilder");
    this.levelBuilder.setAttribute("gradient-stops", stopsJson);

    // const sections = this.querySelectorAll('section[data-title]');
    this.themeGrid = shadow.querySelector("#themeGrid");
    // this.tabPanel = shadow.querySelector('tab-panel');
    // this.themeGrid = this.tabPanel.tabContent.querySelector('[data-title="Grid View"] #themeGrid');
    this.themeGrid.setAttribute("gradient-stops", stopsJson);

    // UNUSED AT THE MOMENT
    this.gradientBuilder = shadow.querySelector("#gradientBuilder");

    // NOTE level-builder's gradient-changed event must send data to theme-grid, because theme grid must update level colors based on level builder's gradient
    this.levelBuilder.addEventListener("gradient-changed", (e) => {
      //   console.log('levelBuilder\'s gradient changed:', e.detail.css);
      //   // Use e.detail.css to apply the gradient elsewhere
      //   // document.body.style.background = e.detail.css;
      this.#colorStops = e.detail.stops;
      //   this.themeGrid.setAttribute('gradient-stops',  JSON.stringify(e.detail.stops));
      const stopsJson = JSON.stringify(this.#colorStops);

      this.themeGrid.setAttribute("gradient-stops", stopsJson);
    });
  }

  fromInput(el, ev) {
    const signal = fromInput(el, ev);
    this.#disposables.add({ dispose: () => signal.terminate() });
    return signal;
  }

  connectedCallback() {
    setTimeout(() => {
      const generatedStyle1 = document.getElementById("#generatedStyle1");
      const generatedStyle2 = this.querySelector("#generatedStyle");
      const generatedStyle3 = this.shadowRoot.querySelector("#generatedStyle");

      console.log(generatedStyle1, generatedStyle2, generatedStyle3);
    }, 1000);

    // this.#disposables.add(new DisposableEventListener(this.themeGrid, "generated", (e) => this.generatedStyle.innerHTML = e.detail.css ));
    // console.log(this.generatedStyle);
  }

  disconnectedCallback() {
    this.#disposables.dispose();
  }
}

function html(a, ...b) {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, index) => [a[index], b[index]])
    .flat()
    .join("");
} // For Code Highlighters (zed editor treats html`` as html and highlights the syntax)
