create or replace package dummy_pkg 
is
    function bla ( p_err in varchar2 ) return varchar2;
end dummy_pkg;
/

create or replace package body dummy_pkg 
is
    function bla ( p_err in varchar2 ) return varchar2
    is
       l_err varchar2(4000);
    begin
       l_err := p_err;
       dbms_output.put_line(l_err);
    end bla;
end dummy_pkg;
/



