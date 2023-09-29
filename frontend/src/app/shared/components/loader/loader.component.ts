import {Component, OnInit} from '@angular/core';
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit{
  isShowed: boolean = false;

  constructor(private loderService: LoaderService) {
  }

  ngOnInit() {
    this.loderService.isShowed$.subscribe((isShowed: boolean) => {
      this.isShowed = isShowed;
    })
  }
}
