import {
  Component,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'simple-tiny',
  template: `<textarea id="{{elementId}}"></textarea>`
})
export class SimpleTinyComponent implements AfterViewInit, OnDestroy {

  private _contents: string;
  @Input() elementId: string;
  @Output() onEditorKeyup = new EventEmitter<any>();

  editor;

  @Input()
  set contents(contents: string) {
    if (this.editor) {
      this.editor.setContent(contents);
    }
    this._contents = contents;
  }

  get contents() { return this._contents; }

  ngAfterViewInit() {
    tinymce.init({
      selector: '#' + this.elementId,
      plugins: ['link', 'paste', 'table'],
      skin_url: '/assets/skins/lightgray',
      statusbar: false,
      menubar: false,
      min_height: 400,
      setup: editor => {
        this.editor = editor;
        editor.on('keyup', () => {
          const content = editor.getContent();
          this.onEditorKeyup.emit(content);
        });
        editor.on('init', () => {
        if (this._contents) {
            this.editor.setContent(this._contents);
          }
        });
      },
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }
}