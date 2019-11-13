import { Component, OnInit, Inject } from '@angular/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import * as _moment from 'moment';
import {DatePipe} from '@angular/common';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CourseService } from '../service/course.service';
import { AlertService } from '../service/alert.service';
import { MentorCourse } from '../models/mentorCourse';
import { first } from 'rxjs/operators';
import { UpdateCourse } from '../models/updateCourse';
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-update-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ]
})
export class UpdateCourseComponent implements OnInit {

  form: FormGroup;
  loading = false;
  submitted = false;
  updatecourse: MentorCourse;
  minDate: Date;
  constructor(
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateCourseComponent>,
    @Inject(MAT_DIALOG_DATA) {course},
    private courseService: CourseService,
    private alertService: AlertService) {
      this.updatecourse = course;
      this.form = fb.group({
        id: [this.updatecourse.id],
        name: [this.updatecourse.name, Validators.required],
        description: [this.updatecourse.description],
        startAt: [this.updatecourse.startDate, Validators.required],
        endAt: [this.updatecourse.endDate, Validators.required],
        skill: [this.updatecourse.skill, Validators.required],
        fee: [this.updatecourse.fee, Validators.required],
        });
    }

  ngOnInit() {
    this.minDate = new Date();
  }

  update() {
    if (this.form.valid) {
      const course: UpdateCourse = {
        id: this.form.value.id,
        name : this.form.value.name,
        description : this.form.value.description,
        skill: this.form.value.skill,
        startDate: this.datePipe.transform(this.form.value.startAt, 'yyyy-MM-dd'),
        endDate: this.datePipe.transform(this.form.value.endAt, 'yyyy-MM-dd'),
        mentorName: this.form.value.mentorName,
        fee: this.form.value.fee
      };
      this.submitted = true;

      // reset alerts on submit
      this.alertService.clear();

      this.loading = true;
      this.courseService.updateCourse(course)
      .pipe(first())
        .subscribe(
            data => {
              // tslint:disable-next-line:no-string-literal
              if (data['code'] === 200) {
                // tslint:disable-next-line:no-string-literal
                this.alertService.success(data['message']);
              }
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
      this.dialogRef.close(course);
    }
}

close() {
    this.dialogRef.close();
}

}
