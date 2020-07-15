import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { filter, pluck, switchMap, tap } from 'rxjs/operators';

import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
})
export class ListUsersComponent implements OnInit {
  dataSource$ = this.usersService.entities$.pipe(
    pluck('data'),
    tap(() => this.spinner.hide())
  );
  columns = ['id', 'email', 'first_name'];

  constructor(
    private readonly usersService: UsersService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly spinner: SpinnerVisibilityService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.spinner.show();
    this.usersService.getUsers();
  }

  tableActions(action) {
    console.log('ListUsersComponent -> tableActions -> action', action);
    switch (action?.name) {
      case 'delete':
        this.deleteCallback(action);
        break;
      default:
        break;
    }
  }

  deleteCallback(action) {
    const userID = action?.row?.id;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        message: `Do you want to delete the user id: ${userID}`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.usersService.deleteUser(userID)),
        tap(() => this.openSnackbar('User deleted successfully!')),
        tap(() => this.getUsers())
      )
      .subscribe();
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 3_000,
    });
  }
}
