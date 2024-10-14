import { Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { deepMirror } from './utils/mirror';
import './utils/deep-signal';

type Inner = {
  z?: number | null | undefined;
  a?: number | null | undefined;
};

type Outer = {
  x: number | null | undefined;
  y: Inner | null | undefined;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'reactive-helpers';

  data = signal<Outer>({ x: 1, y: { z: null, a: 1 } });
  deep = deepMirror(this.data);

  constructor() {
    effect(() => {
      console.log('computedNested', this.deep().y()?.z?.());
    });

    setTimeout(() => {
      this.deep().y()?.z?.set(17);
    });
  }
}
